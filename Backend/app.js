const express = require('express');
const app = express();
const { dbconnect } = require('./dbconnect');

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // for form submissions

// Connect to the database
let db;
let collection;

(async () => {
  db = await dbconnect();
  collection = db.collection('students');
})();

app.post('/submit-admission', async (req, res) => {
  try {
    const formData = req.body;
    const result = await collection.insertOne(formData);
    res.status(200).send('Admission form submitted successfully!');
  } catch (error) {
    console.error('Error saving form:', error);
    res.status(500).send('Something went wrong.');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
