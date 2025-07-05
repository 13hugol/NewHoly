// dbconnect.js

const { MongoClient } = require('mongodb');
require('dotenv').config(); // This line loads the .env file

// --- ADD THIS DIAGNOSTIC LOG ---
console.log('--- DATABASE CONNECTION CHECK ---');
console.log('The MONGODB_URI being used is:', process.env.MONGODB_URI);
console.log('-------------------------------');
// ---------------------------------

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // This error will now correctly stop the server if the URI is not found.
    throw new Error('FATAL ERROR: MONGODB_URI environment variable is not defined in .env file or system environment.');
}

async function dbconnect() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('Successfully connected to MongoDB Atlas!');
        return client.db();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
}

module.exports = { dbconnect };