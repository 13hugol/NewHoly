const express = require('express');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const multer = require('multer'); // For handling multipart/form-data (file uploads)
const jwt = require('jsonwebtoken'); // For JSON Web Tokens
const fs = require('fs'); // For file system operations (checking/creating upload directory)

// Assuming these are correctly set up in your project
const { dbconnect } = require('./dbconnect'); // This file is crucial for DB connection

const app = express();
const PORT = process.env.PORT || 3000;

// --- Configuration ---
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key'; // **IMPORTANT: Use a strong, environment-variable-based secret in production**
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
const upload = multer({ storage: storage });

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
let db, studentsCollection, programsCollection, contactsCollection, newsEventsCollection, testimonialsCollection, facultyCollection, quickLinksCollection, galleryCollection;

// Reusable CRUD function generator
const generateCRUD = (collection, route) => {
    // GET all items (PUBLICLY ACCESSIBLE)
    app.get(`/api/${route}`, async (req, res) => { // <-- REMOVED authenticateToken HERE
        try {
            const data = await collection.find().toArray();
            res.json({ data: data }); // Consistent response format
        } catch (err) {
            console.error(`Failed to fetch ${route}:`, err);
            res.status(500).json({ message: `Failed to fetch ${route}` });
        }
    });

    // GET single item by ID (PUBLICLY ACCESSIBLE)
    app.get(`/api/${route}/:id`, async (req, res) => { // <-- REMOVED authenticateToken HERE
        try {
            const item = await collection.findOne({ _id: new ObjectId(req.params.id) });
            if (!item) {
                return res.status(404).json({ message: `${route.slice(0, -1)} not found.` });
            }
            res.json({ data: item }); // Consistent response format for single item
        } catch (err) {
            console.error(`Failed to fetch single ${route.slice(0, -1)}:`, err);
            res.status(500).json({ message: `Failed to fetch ${route.slice(0, -1)}` });
        }
    });

    // POST new item (PROTECTED - requires authentication)
    app.post(`/api/${route}`, authenticateToken, async (req, res) => {
        try {
            const result = await collection.insertOne(req.body);
            res.status(201).json({ success: true, insertedId: result.insertedId, message: `${route.slice(0, -1)} added successfully!` });
        } catch (err) {
            console.error(`Failed to add ${route}:`, err);
            res.status(500).json({ message: `Failed to add ${route}` });
        }
    });

    // PUT update item by ID (PROTECTED - requires authentication)
    app.put(`/api/${route}/:id`, authenticateToken, async (req, res) => {
        try {
            const result = await collection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: req.body }
            );
            if (result.modifiedCount === 0 && result.matchedCount === 0) {
                return res.status(404).json({ message: `${route.slice(0, -1)} not found or no changes made.` });
            }
            res.json({ success: true, message: `${route.slice(0, -1)} updated successfully!` });
        } catch (err) {
            console.error(`Failed to update ${route}:`, err);
            res.status(500).json({ message: `Failed to update ${route}` });
        }
    });

    // DELETE item by ID (PROTECTED - requires authentication)
    app.delete(`/api/${route}/:id`, authenticateToken, async (req, res) => {
        try {
            const result = await collection.deleteOne({ _id: new ObjectId(req.params.id) });
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: `${route.slice(0, -1)} not found.` });
            }
            res.json({ success: true, message: `${route.slice(0, -1)} deleted successfully!` });
        } catch (err) {
            console.error(`Failed to delete ${route}:`, err);
            res.status(500).json({ message: `Failed to delete ${route}` });
        }
    });
};

// --- Custom Authentication Middleware for Admin Panel ---
const authenticateToken = (req, res, next) => {
    // Note: CORS preflight (OPTIONS method) is already handled by the global CORS middleware above.
    // This check is primarily for actual authenticated requests.
    if (req.method === 'OPTIONS') {
        return next(); // Allow OPTIONS requests to pass through without token verification
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification failed:', err);
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = user; // Attach user payload to request
        next();
    });
};

// ---------- ROUTES ---------- //

// Admin Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // --- Hardcoded Admin Credentials (for demo purposes) ---
    // In a real application, you would fetch user from DB and hash/compare passwords
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'password123'; // Matches frontend's hardcoded password

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Generate JWT
        const user = { username: ADMIN_USERNAME, role: 'admin' };
        const accessToken = jwt.sign(user, JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour
        res.json({ token: accessToken, message: 'Login successful!' });
    } else {
        res.status(401).json({ message: 'Invalid username or password.' });
    }
});

// Image Upload Route (Protected)
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image file uploaded.' });
    }
    // Return the URL where the image can be accessed
    // Assuming your server is running on PORT and serving static files from /uploads
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl: imageUrl, message: 'Image uploaded successfully!' });
});

// Admission Form
app.post('/submit-admission', (req, res) => {
    try {
        studentsCollection.insertOne(req.body);
        console.log('Admission submitted:', req.body);
        res.redirect('/index.html?status=success');
    } catch (err) {
        console.error('Admission error:', err);
        res.redirect('/index.html?status=error');
    }
});

// Contact Form
app.post('/submit-contact', async (req, res) => {
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

// GET contacts (protected, as contact messages might be sensitive)
app.get('/api/contacts', authenticateToken, async (req, res) => {
    try {
        const contacts = await contactsCollection.find().toArray();
        res.json({ data: contacts }); // Consistent response format
    } catch (err) {
        console.error('Failed to fetch contacts:', err);
        res.status(500).json({ message: 'Failed to fetch contacts' });
    }
});

// DELETE contact (protected)
app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
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


// Serve static files from the 'Frontend' directory
// This should be placed AFTER your API routes to prevent it from catching API requests
app.use(express.static(path.join(__dirname, '../Frontend')));
// Serve uploaded images directly
app.use('/uploads', express.static(UPLOADS_DIR));

// --- Admin Panel Route (Single Page App) ---

// Serve admin.html for /admin and any /admin/* route (SPA support, avoids path-to-regexp error)
app.get(/^\/admin(\/.*)?$/, (req, res) => {
    res.sendFile(path.join(__dirname, '../Frontend/admin.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel available at http://localhost:${PORT}/admin`);
});


// Database connection and API generation
(async () => {
    try {
        db = await dbconnect();
        studentsCollection = db.collection('students');
        programsCollection = db.collection('programs');
        contactsCollection = db.collection('contacts');
        newsEventsCollection = db.collection('news_events');
        testimonialsCollection = db.collection('testimonials');
        facultyCollection = db.collection('faculty');
        quickLinksCollection = db.collection('quick_links');
        galleryCollection = db.collection('gallery'); // Initialize gallery collection
        console.log('Connected to MongoDB');

        // Generate APIs for all collections *after* they are initialized
        generateCRUD(programsCollection, 'programs');
        generateCRUD(newsEventsCollection, 'newsEvents');
        generateCRUD(testimonialsCollection, 'testimonials');
        generateCRUD(facultyCollection, 'faculty');
        generateCRUD(galleryCollection, 'gallery');
        generateCRUD(quickLinksCollection, 'quickLinks');

    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1); // Exit process if DB connection fails
    }
})();
