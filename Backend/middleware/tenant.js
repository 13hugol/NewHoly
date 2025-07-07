// Backend/middleware/tenant.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key_for_holy_cross_school_2025!';

/**
 * Middleware to extract organization context from request
 * Supports both subdomain-based and parameter-based tenant identification
 */
const extractTenant = (req, res, next) => {
    let organizationId = null;

    // Method 1: Extract from subdomain (e.g., newholy.schoolsaas.com)
    const host = req.get('host');
    if (host) {
        const subdomain = host.split('.')[0];
        if (subdomain && subdomain !== 'api' && subdomain !== 'admin' && subdomain !== 'www' && subdomain !== 'localhost') {
            organizationId = subdomain;
        }
    }

    // Method 2: Extract from URL parameter (e.g., /api/org/newholy/students)
    if (!organizationId && req.params.orgId) {
        organizationId = req.params.orgId;
    }

    // Method 3: Extract from header (for API requests)
    if (!organizationId && req.headers['x-organization-id']) {
        organizationId = req.headers['x-organization-id'];
    }
    
    // Method 4: For authenticated users, use their organization from token
    if (!organizationId && req.user) {
        if (req.user.role === 'super_admin') {
            // Super admin can work without organization context or use header/param
            req.isSuperAdmin = true;
        } else if (req.user.organizationId) {
            // Regular users get their organization from their token
            organizationId = req.user.organizationId;
        }
    }

    req.organizationId = organizationId;
    if (!req.isSuperAdmin) {
        req.isSuperAdmin = false;
    }

    console.log(`[extractTenant] User: ${req.user?.email}, OrgId: ${organizationId}, SuperAdmin: ${req.isSuperAdmin}`);
    next();
};

/**
 * Enhanced authentication middleware with multi-tenant support
 */
const authenticateToken = async (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    try {
        const user = jwt.verify(token, JWT_SECRET);
        
        // Add user to request
        req.user = user;
        req.isSuperAdmin = user.role === 'super_admin';

        // For super admin, allow access to any organization
        if (req.isSuperAdmin) {
            return next();
        }

        // For regular users, verify they can access the requested organization
        if (req.organizationId && user.organizationId !== req.organizationId) {
            return res.status(403).json({ 
                message: 'Access denied to this organization.' 
            });
        }

        // If no organization specified in request, use user's organization
        if (!req.organizationId) {
            req.organizationId = user.organizationId;
        }

        next();
    } catch (err) {
        console.error('JWT verification failed:', err);
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

/**
 * Super admin only middleware
 */
const requireSuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ 
            message: 'Super admin access required.' 
        });
    }
    next();
};

/**
 * Permission-based middleware
 */
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required.' });
        }

        if (req.user.role === 'super_admin') {
            return next(); // Super admin has all permissions
        }

        if (!req.user.permissions || !req.user.permissions.includes(permission)) {
            return res.status(403).json({ 
                message: `Permission '${permission}' required.` 
            });
        }

        next();
    };
};

/**
 * Organization isolation middleware
 * Ensures all database queries are scoped to the current organization
 */
const ensureOrganizationScope = (req, res, next) => {
    // Skip for super admin routes
    if (req.isSuperAdmin && req.path.startsWith('/super-admin/')) {
        return next();
    }

    // Ensure organization context exists for non-super-admin routes
    if (!req.organizationId && !req.isSuperAdmin) {
        return res.status(400).json({ 
            message: 'Organization context required.' 
        });
    }

    // Add organization filter to request body for create/update operations
    if (req.method === 'POST' || req.method === 'PUT') {
        if (req.body && !req.isSuperAdmin) {
            req.body.organizationId = req.organizationId;
        }
    }

    next();
};

/**
 * Database query scoping helper
 */
const addOrganizationFilter = (req, baseFilter = {}) => {
    if (req.isSuperAdmin && !req.organizationId) {
        return baseFilter; // Super admin can see all data
    }
    
    return {
        ...baseFilter,
        organizationId: req.organizationId
    };
};

/**
 * Validate organization exists and is active
 */
const validateOrganization = (Organization) => {
    return async (req, res, next) => {
        if (!req.organizationId || req.isSuperAdmin) {
            return next();
        }

        try {
            const org = await Organization.findByOrganizationId(req.organizationId);
            
            if (!org) {
                return res.status(404).json({ 
                    message: 'Organization not found.' 
                });
            }

            if (org.subscription.status !== 'active' || 
                new Date() > new Date(org.subscription.expiresAt)) {
                return res.status(403).json({ 
                    message: 'Organization subscription is not active.' 
                });
            }

            req.organization = org;
            next();
        } catch (error) {
            console.error('Organization validation error:', error);
            return res.status(500).json({ 
                message: 'Error validating organization.' 
            });
        }
    };
};

/**
 * Feature gate middleware - check if organization has access to specific feature
 */
const requireFeature = (feature) => {
    return (req, res, next) => {
        if (req.isSuperAdmin) {
            return next(); // Super admin bypasses feature gates
        }

        if (!req.organization || 
            !req.organization.subscription.features.includes(feature)) {
            return res.status(403).json({ 
                message: `Feature '${feature}' not available in your subscription plan.` 
            });
        }

        next();
    };
};

module.exports = {
    extractTenant,
    authenticateToken,
    requireSuperAdmin,
    requirePermission,
    ensureOrganizationScope,
    addOrganizationFilter,
    validateOrganization,
    requireFeature
};
