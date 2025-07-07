// Backend/routes/superAdmin.js
const express = require('express');
const router = express.Router();
const { requireSuperAdmin, requirePermission } = require('../middleware/tenant');

/**
 * Super Admin Routes
 * All routes in this file require super admin authentication
 */

const setupSuperAdminRoutes = (app, db, Organization, User) => {
    // Apply super admin middleware to all routes
    app.use('/api/super-admin', requireSuperAdmin);

    // ==================== ORGANIZATION MANAGEMENT ====================

    // Get all organizations with stats
    app.get('/api/super-admin/organizations', async (req, res) => {
        try {
            const organizations = await Organization.findAll();
            const stats = await Organization.getOrganizationStats();
            
            res.json({
                data: organizations,
                stats: stats,
                total: organizations.length
            });
        } catch (error) {
            console.error('Error fetching organizations:', error);
            res.status(500).json({ message: 'Failed to fetch organizations' });
        }
    });

    // Get single organization
    app.get('/api/super-admin/organizations/:orgId', async (req, res) => {
        try {
            const organization = await Organization.findByOrganizationId(req.params.orgId);
            if (!organization) {
                return res.status(404).json({ message: 'Organization not found' });
            }

            // Get organization users
            const users = await User.findByOrganization(req.params.orgId);
            const userStats = await User.getUserStats(req.params.orgId);

            res.json({
                data: organization,
                users: users.map(u => ({ ...u, password: undefined })), // Remove passwords
                userStats: userStats
            });
        } catch (error) {
            console.error('Error fetching organization:', error);
            res.status(500).json({ message: 'Failed to fetch organization' });
        }
    });

    // Create new organization
    app.post('/api/super-admin/organizations', async (req, res) => {
        try {
            const {
                name,
                domain,
                plan = 'basic',
                adminEmail,
                adminPassword,
                adminName,
                ...organizationData
            } = req.body;

            // Validate required fields
            if (!name || !adminEmail || !adminPassword) {
                return res.status(400).json({ 
                    message: 'Organization name, admin email, and password are required' 
                });
            }

            // Create organization
            const organization = await Organization.create({
                name,
                domain,
                plan,
                ...organizationData
            });

            // Create admin user for this organization
            const adminUser = await User.create({
                username: adminEmail,
                email: adminEmail,
                password: adminPassword,
                name: adminName || 'Admin',
                role: 'school_admin',
                organizationId: organization.organizationId
            });

            res.status(201).json({
                success: true,
                message: 'Organization created successfully',
                data: {
                    organization,
                    adminUser: { ...adminUser, password: undefined }
                }
            });
        } catch (error) {
            console.error('Error creating organization:', error);
            if (error.code === 11000) {
                res.status(400).json({ message: 'Organization name or domain already exists' });
            } else {
                res.status(500).json({ message: 'Failed to create organization' });
            }
        }
    });

    // Update organization
    app.put('/api/super-admin/organizations/:orgId', async (req, res) => {
        try {
            const success = await Organization.update(req.params.orgId, req.body);
            if (!success) {
                return res.status(404).json({ message: 'Organization not found' });
            }

            res.json({
                success: true,
                message: 'Organization updated successfully'
            });
        } catch (error) {
            console.error('Error updating organization:', error);
            res.status(500).json({ message: 'Failed to update organization' });
        }
    });

    // Update organization subscription
    app.put('/api/super-admin/organizations/:orgId/subscription', async (req, res) => {
        try {
            const { plan, status, expiresAt } = req.body;
            
            const subscriptionData = {
                plan: plan || 'basic',
                status: status || 'active',
                expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                features: Organization.getPlanFeatures(plan || 'basic')
            };

            const success = await Organization.updateSubscription(req.params.orgId, subscriptionData);
            if (!success) {
                return res.status(404).json({ message: 'Organization not found' });
            }

            res.json({
                success: true,
                message: 'Subscription updated successfully'
            });
        } catch (error) {
            console.error('Error updating subscription:', error);
            res.status(500).json({ message: 'Failed to update subscription' });
        }
    });

    // Delete organization (careful operation)
    app.delete('/api/super-admin/organizations/:orgId', async (req, res) => {
        try {
            // First, delete all users from this organization
            const users = await User.findByOrganization(req.params.orgId);
            for (const user of users) {
                await User.delete(user._id);
            }

            // Delete all organization data from collections
            const collections = ['students', 'programs', 'contacts', 'news_events', 'testimonials', 'faculty', 'quick_links', 'gallery'];
            for (const collectionName of collections) {
                const collection = db.collection(collectionName);
                await collection.deleteMany({ organizationId: req.params.orgId });
            }

            // Finally, delete the organization
            const success = await Organization.delete(req.params.orgId);
            if (!success) {
                return res.status(404).json({ message: 'Organization not found' });
            }

            res.json({
                success: true,
                message: 'Organization and all related data deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting organization:', error);
            res.status(500).json({ message: 'Failed to delete organization' });
        }
    });

    // ==================== USER MANAGEMENT ====================

    // Get all users across organizations
    app.get('/api/super-admin/users', async (req, res) => {
        try {
            const { organizationId, role, page = 1, limit = 50 } = req.query;
            
            let filter = {};
            if (organizationId) filter.organizationId = organizationId;
            if (role) filter.role = role;

            // For pagination
            const skip = (page - 1) * limit;
            
            const users = await User.collection.find(filter)
                .skip(skip)
                .limit(parseInt(limit))
                .project({ password: 0 })
                .toArray();

            const total = await User.collection.countDocuments(filter);
            const userStats = await User.getUserStats();

            res.json({
                data: users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                stats: userStats
            });
        } catch (error) {
            console.error('Error fetching users:', error);
            res.status(500).json({ message: 'Failed to fetch users' });
        }
    });

    // Create user for any organization
    app.post('/api/super-admin/users', async (req, res) => {
        try {
            const user = await User.create(req.body);
            res.status(201).json({
                success: true,
                message: 'User created successfully',
                data: user
            });
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.code === 11000) {
                res.status(400).json({ message: 'Email or username already exists' });
            } else {
                res.status(500).json({ message: 'Failed to create user' });
            }
        }
    });

    // Update any user
    app.put('/api/super-admin/users/:userId', async (req, res) => {
        try {
            const success = await User.update(req.params.userId, req.body);
            if (!success) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                success: true,
                message: 'User updated successfully'
            });
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ message: 'Failed to update user' });
        }
    });

    // Toggle user status
    app.put('/api/super-admin/users/:userId/toggle-status', async (req, res) => {
        try {
            const success = await User.toggleStatus(req.params.userId);
            if (!success) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                success: true,
                message: 'User status toggled successfully'
            });
        } catch (error) {
            console.error('Error toggling user status:', error);
            res.status(500).json({ message: 'Failed to toggle user status' });
        }
    });

    // Delete user
    app.delete('/api/super-admin/users/:userId', async (req, res) => {
        try {
            const success = await User.delete(req.params.userId);
            if (!success) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ message: 'Failed to delete user' });
        }
    });

    // ==================== ANALYTICS & REPORTING ====================

    // Dashboard overview
    app.get('/api/super-admin/dashboard', async (req, res) => {
        try {
            const [organizations, orgStats, userStats, recentUsers] = await Promise.all([
                Organization.findAll(),
                Organization.getOrganizationStats(),
                User.getUserStats(),
                User.getRecentUsers(null, 10)
            ]);

            const totalUsers = userStats.reduce((sum, stat) => sum + stat.count, 0);
            const activeOrgs = organizations.filter(org => 
                org.subscription.status === 'active' && 
                new Date() <= new Date(org.subscription.expiresAt)
            ).length;

            res.json({
                overview: {
                    totalOrganizations: organizations.length,
                    activeOrganizations: activeOrgs,
                    totalUsers: totalUsers,
                    organizationsByPlan: orgStats,
                    usersByRole: userStats
                },
                recentUsers: recentUsers.map(u => ({ ...u, password: undefined })),
                recentOrganizations: organizations
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 5)
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            res.status(500).json({ message: 'Failed to fetch dashboard data' });
        }
    });

    // System health check
    app.get('/api/super-admin/health', async (req, res) => {
        try {
            const dbStatus = db.readyState === 1 ? 'connected' : 'disconnected';
            const expiredOrgs = await Organization.collection.find({
                'subscription.expiresAt': { $lt: new Date() }
            }).toArray();

            res.json({
                status: 'healthy',
                database: dbStatus,
                expiredSubscriptions: expiredOrgs.length,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Health check error:', error);
            res.status(500).json({
                status: 'unhealthy',
                error: error.message
            });
        }
    });
};

module.exports = setupSuperAdminRoutes;
