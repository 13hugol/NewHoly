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