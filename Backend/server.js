const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Import multi-tenant components
const Organization = require('./models/Organization');
const User = require('./models/User');
const { 
    extractTenant, 
    authenticateToken,
    requireSuperAdmin,
    ensureOrganizationScope,
    addOrganizationFilter,
    validateOrganization 
} = require('./middleware/tenant');
const setupSuperAdminRoutes = require('./routes/superAdmin');

const { dbconnect } = require('./dbconnect');

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key_for_holy_cross_school_2025!';
const UPLOADS_DIR = path.join(__dirname, '../Frontend/Images');

// Ensure the uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Multi-tenant middleware (before routes, but after auth for API routes)
app.use((req, res, next) => {
    // Skip tenant extraction for login and static files
    if (req.path === '/api/login' || 
        req.path.startsWith('/css/') ||
        req.path.startsWith('/js/') ||
        req.path.startsWith('/Images/') ||
        req.path.includes('.')) {
        return next();
    }
    
    // For API routes, run authentication first, then tenant extraction
    if (req.path.startsWith('/api/')) {
        return authenticateToken(req, res, (err) => {
            if (err) return next(err);
            extractTenant(req, res, next);
        });
    }
    
    // For non-API routes, just extract tenant
    extractTenant(req, res, next);
});

// DB Collections and Models (initialized after connection)
let db, organizationModel, userModel;
let studentsCollection, programsCollection, contactsCollection, newsEventsCollection, 
    testimonialsCollection, facultyCollection, quickLinksCollection, galleryCollection;

// Enhanced Authentication Middleware for Multi-tenant
const legacyAuthenticateToken = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification failed:', err);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user;
        next();
    });
};

// Enhanced CRUD function generator with multi-tenant support
const generateCRUD = (collectionName, apiRoutePrefix) => {
    const checkDbReady = (req, res, next) => {
        if (!db) {
            console.error('Database not connected for route:', req.path);
            return res.status(503).json({ message: 'Database service unavailable. Please try again later.' });
        }
        next();
    };

    // GET all items (with organization filtering)
    app.get(`/api/${apiRoutePrefix}`, checkDbReady, async (req, res) => {
        try {
            const collection = db.collection(collectionName);
            const filter = addOrganizationFilter(req);
            const data = await collection.find(filter).toArray();
            res.json({ data: data });
        } catch (err) {
            console.error(`Failed to fetch ${apiRoutePrefix}:`, err);
            res.status(500).json({ message: `Failed to fetch ${apiRoutePrefix}` });
        }
    });

    // GET single item by ID (with organization filtering)
    app.get(`/api/${apiRoutePrefix}/:id`, checkDbReady, async (req, res) => {
        try {
            const collection = db.collection(collectionName);
            const filter = addOrganizationFilter(req, { _id: new ObjectId(req.params.id) });
            const item = await collection.findOne(filter);
            if (!item) {
                return res.status(404).json({ message: `${apiRoutePrefix.slice(0, -1)} not found.` });
            }
            res.json({ data: item });
        } catch (err) {
            console.error(`Failed to fetch single ${apiRoutePrefix.slice(0, -1)}:`, err);
            res.status(500).json({ message: `Failed to fetch ${apiRoutePrefix.slice(0, -1)}` });
        }
    });

    // POST new item (PROTECTED, with organization scoping)
    app.post(`/api/${apiRoutePrefix}`, ensureOrganizationScope, checkDbReady, async (req, res) => {
        try {
            const collection = db.collection(collectionName);
            const dataToInsert = { ...req.body };
            delete dataToInsert._id;
            
            // Add organization ID for non-super-admin users
            if (!req.isSuperAdmin) {
                dataToInsert.organizationId = req.organizationId;
            }

            const result = await collection.insertOne(dataToInsert);
            res.status(201).json({ 
                success: true, 
                insertedId: result.insertedId, 
                message: `${apiRoutePrefix.slice(0, -1)} added successfully!` 
            });
        } catch (err) {
            console.error(`Failed to add ${apiRoutePrefix}:`, err);
            res.status(500).json({ message: `Failed to add ${apiRoutePrefix}` });
        }
    });

    // PUT update item by ID (PROTECTED, with organization scoping)
    app.put(`/api/${apiRoutePrefix}/:id`, ensureOrganizationScope, checkDbReady, async (req, res) => {
        try {
            const collection = db.collection(collectionName);
            const dataToUpdate = { ...req.body };
            delete dataToUpdate._id;
            delete dataToUpdate.organizationId; // Prevent organization ID modification

            const filter = addOrganizationFilter(req, { _id: new ObjectId(req.params.id) });
            const result = await collection.updateOne(filter, { $set: dataToUpdate });
            
            if (result.modifiedCount === 0 && result.matchedCount === 0) {
                return res.status(404).json({ message: `${apiRoutePrefix.slice(0, -1)} not found or no changes made.` });
            }
            res.json({ success: true, message: `${apiRoutePrefix.slice(0, -1)} updated successfully!` });
        } catch (err) {
            console.error(`Failed to update ${apiRoutePrefix}:`, err);
            res.status(500).json({ message: `Failed to update ${apiRoutePrefix}` });
        }
    });

    // DELETE item by ID (PROTECTED, with organization scoping)
    app.delete(`/api/${apiRoutePrefix}/:id`, ensureOrganizationScope, checkDbReady, async (req, res) => {
        try {
            const collection = db.collection(collectionName);
            const filter = addOrganizationFilter(req, { _id: new ObjectId(req.params.id) });
            const result = await collection.deleteOne(filter);
            
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: `${apiRoutePrefix.slice(0, -1)} not found.` });
            }
            res.json({ success: true, message: `${apiRoutePrefix.slice(0, -1)} deleted successfully!` });
        } catch (err) {
            console.error(`Failed to delete ${apiRoutePrefix}:`, err);
            res.status(500).json({ message: `Failed to delete ${apiRoutePrefix}` });
        }
    });
};

// Enhanced login route with multi-tenant support
app.post('/api/login', async (req, res) => {
    const { email, password, username } = req.body;
    
    try {
        // Try to authenticate with new user system first
        if (userModel) {
            const user = await userModel.authenticate(email || username, password);
            if (user) {
                const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
                return res.json({ token: accessToken, message: 'Login successful!' });
            }
        }

        // Fall back to legacy authentication for existing users
        const ADMIN_USERNAME = process.env.user;
        const ADMIN_PASSWORD = process.env.pass;

        if ((username === ADMIN_USERNAME || email === ADMIN_USERNAME) && password === ADMIN_PASSWORD) {
            const user = { 
                username: ADMIN_USERNAME, 
                email: ADMIN_USERNAME,
                role: 'school_admin',
                organizationId: 'new_holy_cross_school'
            };
            const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' });
            return res.json({ token: accessToken, message: 'Login successful!' });
        }

        res.status(401).json({ message: 'Invalid credentials.' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login failed. Please try again.' });
    }
});

// Image Upload Route (Protected)
app.post('/api/upload', (req, res) => {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ message: 'File too large. Maximum 5MB allowed.' });
            }
            return res.status(400).json({ message: err.message });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded or file type not allowed.' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ imageUrl: imageUrl, message: 'Image uploaded successfully!' });
    });
});

// Admission Form (with organization scoping)
app.post('/submit-admission', async (req, res) => {
    if (!studentsCollection) return res.status(503).json({ error: 'Database not ready.' });
    try {
        const submissionData = { 
            ...req.body,
            organizationId: req.organizationId || 'new_holy_cross_school', // Default to NewHoly
            submittedAt: new Date()
        };
        
        await studentsCollection.insertOne(submissionData);
        console.log('Admission submitted:', submissionData);
        res.redirect('/index.html?status=success');
    } catch (err) {
        console.error('Admission error:', err);
        res.redirect('/index.html?status=error');
    }
});

// Contact Form (with organization scoping)
app.post('/submit-contact', async (req, res) => {
    if (!contactsCollection) return res.status(503).json({ error: 'Database not ready.' });
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        const contactData = {
            name,
            email,
            message,
            organizationId: req.organizationId || 'new_holy_cross_school', // Default to NewHoly
            submittedAt: new Date()
        };
        
        await contactsCollection.insertOne(contactData);
        res.status(200).json({ message: 'Message received successfully.' });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Enhanced Contact API routes (Protected, with organization scoping)
app.get('/api/contacts', async (req, res) => {
    if (!contactsCollection) return res.status(503).json({ message: 'Database not ready.' });
    try {
        const filter = addOrganizationFilter(req);
        const contacts = await contactsCollection.find(filter).toArray();
        res.json({ data: contacts });
    } catch (err) {
        console.error('Failed to fetch contacts:', err);
        res.status(500).json({ message: 'Failed to fetch contacts' });
    }
});

app.delete('/api/contacts/:id', async (req, res) => {
    if (!contactsCollection) return res.status(503).json({ message: 'Database not ready.' });
    try {
        const filter = addOrganizationFilter(req, { _id: new ObjectId(req.params.id) });
        const result = await contactsCollection.deleteOne(filter);
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Contact not found.' });
        }
        res.json({ success: true, message: 'Contact deleted successfully.' });
    } catch (err) {
        console.error('Failed to delete contact:', err);
        res.status(500).json({ message: 'Failed to delete contact' });
    }
});

// Database connection and server start
(async () => {
    try {
        // Connect to DB
        db = await dbconnect();
        console.log('Connected to MongoDB');

        // Initialize models
        organizationModel = new Organization(db);
        userModel = new User(db);

        // Initialize collections
        studentsCollection = db.collection('students');
        programsCollection = db.collection('programs');
        contactsCollection = db.collection('contacts');
        newsEventsCollection = db.collection('news_events');
        testimonialsCollection = db.collection('testimonials');
        facultyCollection = db.collection('faculty');
        quickLinksCollection = db.collection('quick_links');
        galleryCollection = db.collection('gallery');

        // Setup super admin routes BEFORE other routes
        setupSuperAdminRoutes(app, db, organizationModel, userModel);

        // Apply organization validation middleware selectively
        // Only for routes that need organization validation
        const orgValidationMiddleware = validateOrganization(organizationModel);
        
        // Apply to specific routes that need org validation
        app.use('/api/programs', orgValidationMiddleware);
        app.use('/api/newsEvents', orgValidationMiddleware);
        app.use('/api/testimonials', orgValidationMiddleware);
        app.use('/api/facultys', orgValidationMiddleware);
        app.use('/api/gallerys', orgValidationMiddleware);
        app.use('/api/quickLinks', orgValidationMiddleware);
        app.use('/api/contacts', orgValidationMiddleware);

        // Generate CRUD routes for all collections
        generateCRUD('programs', 'programs');
        generateCRUD('news_events', 'newsEvents');
        generateCRUD('testimonials', 'testimonials');
        generateCRUD('faculty', 'facultys');
        generateCRUD('gallery', 'gallerys');
        generateCRUD('quick_links', 'quickLinks');

        // Serve static files from the 'Frontend' directory
        app.use(express.static(path.join(__dirname, '../Frontend')));
        app.use('/uploads', express.static(UPLOADS_DIR));

        // Super Admin Panel Route
        app.get(/^\/super-admin(\/.*)?$/, (req, res) => {
            res.sendFile(path.join(__dirname, '../Frontend/super-admin.html'));
        });

        // Admin Panel Route (for school admins)
        app.get(/^\/admin(\/.*)?$/, (req, res) => {
            res.sendFile(path.join(__dirname, '../Frontend/admin.html'));
        });

        // Start Server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 Super Admin panel: http://localhost:${PORT}/super-admin.html`);
            console.log(`🏫 School Admin panel: http://localhost:${PORT}/admin.html`);
            console.log(`🌐 Public website: http://localhost:${PORT}`);
        });

    } catch (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
})();
