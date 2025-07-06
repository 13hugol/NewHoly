const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer'); 
const jwt = require('jsonwebtoken'); 
const fs = require('fs'); 

const { dbconnect } = require('./dbconnect'); 

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_dev_key_for_holy_cross_school_2025!';
const UPLOADS_DIR = path.join(__dirname, '../Frontend/Images'); // Directory to store uploaded images

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
        // Generate a unique filename to prevent collisions
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB (5 * 1024 * 1024 bytes)
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware
app.use(express.json()); // Parses JSON bodies
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded bodies

// CORS (important for frontend-backend communication if they are on different origins)
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Allow specified HTTP methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specified headers
    // Handle preflight requests (OPTIONS method)
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200); // Respond with 200 OK for preflight
    }
    next(); // Continue to the next middleware/route for actual requests
});


// DB Collections (initialized after connection)
let db, studentsCollection, programsCollection, contactsCollection, newsEventsCollection, testimonialsCollection, facultyCollection, quickLinksCollection, galleryCollection, facilitiesCollection;

// --- Custom Authentication Middleware for Admin Panel ---
const authenticateToken = (req, res, next) => {
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

// Reusable CRUD function generator
// This function now expects collectionName (the actual DB collection name) and apiRoutePrefix (the URL part)
const generateCRUD = (collectionName, apiRoutePrefix) => {
    // Middleware to check if DB is connected
    const checkDbReady = (req, res, next) => {
        if (!db) {
            console.error('Database not connected for route:', req.path);
            return res.status(503).json({ message: 'Database service unavailable. Please try again later.' });
        }
        next();
    };

    // GET all items (PUBLICLY ACCESSIBLE, but admin panel uses authenticatedFetch)
    app.get(`/api/${apiRoutePrefix}`, checkDbReady, async (req, res) => {
        try {
            const collection = db.collection(collectionName);
            const data = await collection.find().toArray();
            res.json({ data: data });
        } catch (err) {
            console.error(`Failed to fetch ${apiRoutePrefix}:`, err);
            res.status(500).json({ message: `Failed to fetch ${apiRoutePrefix}` });
        }
    });

    // GET single item by ID (PUBLICLY ACCESSIBLE, but admin panel uses authenticatedFetch)
    app.get(`/api/${apiRoutePrefix}/:id`, checkDbReady, async (req, res) => {
        try {
            const collection = db.collection(collectionName);
            const item = await collection.findOne({ _id: new ObjectId(req.params.id) });
            if (!item) {
                return res.status(404).json({ message: `${apiRoutePrefix.slice(0, -1)} not found.` });
            }
            res.json({ data: item });
        } catch (err) {
            console.error(`Failed to fetch single ${apiRoutePrefix.slice(0, -1)}:`, err);
            res.status(500).json({ message: `Failed to fetch ${apiRoutePrefix.slice(0, -1)}` });
        }
    });

    // POST new item (PROTECTED)
    app.post(`/api/${apiRoutePrefix}`, authenticateToken, checkDbReady, async (req, res) => {
        try {
            const collection = db.collection(collectionName);
            // Ensure _id is not passed for new inserts, let MongoDB generate it
            const dataToInsert = { ...req.body };
            delete dataToInsert._id; // Remove _id if it exists in the body for POST requests

            const result = await collection.insertOne(dataToInsert);
            res.status(201).json({ success: true, insertedId: result.insertedId, message: `${apiRoutePrefix.slice(0, -1)} added successfully!` });
        } catch (err) {
            console.error(`Failed to add ${apiRoutePrefix}:`, err);
            res.status(500).json({ message: `Failed to add ${apiRoutePrefix}` });
        }
    });

    // PUT update item by ID (PROTECTED)
    app.put(`/api/${apiRoutePrefix}/:id`, authenticateToken, checkDbReady, async (req, res) => {
        try {
            const collection = db.collection(collectionName);
            // For updates, the _id from params is used, and _id in body should be ignored or removed
            const dataToUpdate = { ...req.body };
            delete dataToUpdate._id; // Remove _id from the $set payload to prevent _id modification

            const result = await collection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: dataToUpdate }
            );
            if (result.modifiedCount === 0 && result.matchedCount === 0) {
                return res.status(404).json({ message: `${apiRoutePrefix.slice(0, -1)} not found or no changes made.` });
            }
            res.json({ success: true, message: `${apiRoutePrefix.slice(0, -1)} updated successfully!` });
        } catch (err) {
            console.error(`Failed to update ${apiRoutePrefix}:`, err);
            res.status(500).json({ message: `Failed to update ${apiRoutePrefix}` });
        }
    });

    // DELETE item by ID (PROTECTED)
    app.delete(`/api/${apiRoutePrefix}/:id`, authenticateToken, checkDbReady, async (req, res) => {
        try {
            const collection = db.collection(collectionName);
            const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
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


// ---------- ROUTES ---------- //
// Define all API routes upfront, before static file serving.

// Admin Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const ADMIN_USERNAME = process.env.user;
    const ADMIN_PASSWORD = process.env.pass; // In a real app, hash this password!

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const user = { username: ADMIN_USERNAME, role: 'admin' };
        const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
        res.json({ token: accessToken, message: 'Login successful!' });
    } else {
        res.status(401).json({ message: 'Invalid username or password.' });
    }
});

// Image Upload Route (Protected)
app.post('/api/upload', authenticateToken, (req, res) => {
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
        // Construct the URL for the uploaded image
        const imageUrl = `/uploads/${req.file.filename}`;
        res.json({ imageUrl: imageUrl, message: 'Image uploaded successfully!' });
    });
});

// Admission Form (No authentication needed for public form)
app.post('/submit-admission', async (req, res) => {
    if (!studentsCollection) return res.status(503).json({ error: 'Database not ready.' });
    
    try {
        const { studentName, contact } = req.body;
        
        // Check for existing student with same name and contact number
        const existingStudent = await studentsCollection.findOne({
            studentName: studentName,
            contact: contact
        });
        
        if (existingStudent) {
            // Duplicate found - redirect with error status
            return res.redirect('/index.html?status=duplicate&message=Student with this name and contact number already exists');
        }
        
        // No duplicate found - insert the new admission
        await studentsCollection.insertOne(req.body);
        console.log('Admission submitted:', req.body);
        
        // Success - redirect with success status
        res.redirect('/index.html?status=success&message=Admission submitted successfully');
        
    } catch (err) {
        console.error('Admission error:', err);
        res.redirect('/index.html?status=error&message=Failed to submit admission. Please try again.');
    }
});

// Contact Form (No authentication needed for public form)
app.post('/submit-contact', async (req, res) => {
    if (!contactsCollection) return res.status(503).json({ error: 'Database not ready.' });
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    try {
        await contactsCollection.insertOne({
            name,
            email,
            message,
            submittedAt: new Date()
        });
        res.status(200).json({ message: 'Message received successfully.' });
    } catch (error) {
        console.error('Error saving contact:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// Specific Contact API routes (Protected, for admin panel)
app.get('/api/contacts', authenticateToken, async (req, res) => {
    if (!contactsCollection) return res.status(503).json({ message: 'Database not ready.' });
    try {
        const contacts = await contactsCollection.find().toArray();
        res.json({ data: contacts });
    } catch (err) {
        console.error('Failed to fetch contacts:', err);
        res.status(500).json({ message: 'Failed to fetch contacts' });
    }
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
    if (!contactsCollection) return res.status(503).json({ message: 'Database not ready.' });
    try {
        const result = await contactsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
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
        // Connect to DB and assign collections
        db = await dbconnect(); // dbconnect should return the db instance
        studentsCollection = db.collection('students');
        programsCollection = db.collection('programs');
        contactsCollection = db.collection('contacts');
        newsEventsCollection = db.collection('news_events');
        testimonialsCollection = db.collection('testimonials');
        facultyCollection = db.collection('faculty');
        quickLinksCollection = db.collection('quick_links');
        galleryCollection = db.collection('gallery');
        facilitiesCollection = db.collection('facilities');
        console.log('Connected to MongoDB');

        // Generate CRUD routes for all collections after DB is connected
        // This ensures the collections are assigned before generateCRUD tries to use them
        generateCRUD('programs', 'programs');
        generateCRUD('news_events', 'newsEvents');
        generateCRUD('testimonials', 'testimonials');
        generateCRUD('faculty', 'facultys');
        generateCRUD('gallery', 'gallerys');
        generateCRUD('quick_links', 'quickLinks');
        generateCRUD('facilities', 'facilities');
        // 'contacts' collection is handled by specific routes above, but can also use generateCRUD if desired for consistency
        // generateCRUD('contacts'); // Uncomment if you want to use generic CRUD for contacts too

        // Serve static files from the 'Frontend' directory
        // These MUST be placed AFTER all API routes have been defined
        app.use(express.static(path.join(__dirname, '../Frontend')));
        // Serve uploaded images directly
        app.use('/uploads', express.static(UPLOADS_DIR));

        // Admin Panel Route (Single Page App)
        // Serve admin.html for /admin and any /admin/* route (SPA support)
        app.get(/^\/admin(\/.*)?$/, (req, res) => {
            res.sendFile(path.join(__dirname, '../Frontend/admin.html'));
        });

        // Start Server - Only start server AFTER DB connection and all routes are set up
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
            console.log(`Admin panel available at http://localhost:${PORT}/admin`);
        });

    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit process if DB connection fails
    }
})();
