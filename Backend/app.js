require('dotenv').config();
const express = require('express');
const path = require('path');
// Assuming dbconnect is in a separate file, as per your provided code snippet.
const { dbconnect } = require('./dbconnect');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'Frontend' directory
app.use(express.static(path.join(__dirname, '../Frontend')));

// Connect to MongoDB
let db;
let collection;

(async () => {
    try {
        // Ensure MONGO_URI is correctly set in your .env file
        db = await dbconnect(process.env.MONGO_URI);
        collection = db.collection('students');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to DB:', err);
        // Exit process or handle error appropriately in production
        process.exit(1);
    }
})();

// POST route to handle form submission
app.post('/submit-admission', async (req, res) => {
    const formData = req.body;
    try {
        await collection.insertOne(formData);
        console.log('Form data submitted successfully:', formData);
        // Redirect with a query parameter to indicate success
        res.redirect('/index.html?status=success');
    } catch (error) {
        console.error('Error submitting form data:', error);
        // Redirect with an error parameter or render an error page
        res.redirect('/index.html?status=error');
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});


