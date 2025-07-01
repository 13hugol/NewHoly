
require('dotenv').config();
const express = require('express');
const path = require('path');
const { dbconnect } = require('./dbconnect');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, '../Frontend')));

// Connect to MongoDB
let db;
let collection;

(async () => {
  try {
    db = await dbconnect(process.env.MONGO_URI);
    collection = db.collection('students');
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to DB:', err);
  }
})();

// POST route to handle form submission
app.post('/submit-admission', async (req, res) => {
    const formData = req.body;
    await collection.insertOne(formData);
    res.redirect('/index.html')

});


app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
=======
let express = require('express');
let app = express();
app.use(express.json());
let dbconnect = require('./dbconnect/dbconnect');

app.get('/', (req, res) => {
    res.send('Welcome to the backend server!');
});
app.get('/api', (req, res) => {
    res.send('Welcome to the API!');
});
app.get('/api/data', async (req, res) => {
    try {
        let db = await dbconnect();
        let data = await db.collection('data').find({}).toArray();
        res.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

