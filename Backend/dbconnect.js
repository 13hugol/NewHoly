// dbconnect.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

// --- LOUD AND CLEAR DIAGNOSTIC LOG ---
console.log('\n\n======================================================');
console.log('--- DATABASE CONNECTION ATTEMPT ---');
console.log('======================================================\n\n');
// ------------------------------------

const MONGODB_URI = process.env.MONGODB_URI;

// This check is crucial. If the log above shows 'undefined', this will stop the server.
if (!MONGODB_URI) {
    throw new Error('FATAL ERROR: MONGODB_URI is not defined. Check your .env file location and content.');
}

async function dbconnect() {
    try {
        // The client now knows exactly which database to target from the URI
        const client = new MongoClient(MONGODB_URI);
        await client.connect();

        console.log('SUCCESS: Connected to MongoDB Atlas cluster.');

        // client.db() will now correctly return the 'holycrossschool' database
        // because it's specified in the MONGODB_URI.
        return client.db();
    } catch (error) {
        console.error('\n\n--- MONGODB CONNECTION FAILED ---');
        console.error('This is likely due to one of two reasons:');
        console.error('1. Network Access: Your current IP address is not whitelisted in MongoDB Atlas.');
        console.error('2. Database User: The username/password in the MONGODB_URI is incorrect or lacks permissions.');
        console.error('Original Error:', error);
        console.error('---------------------------------\n\n');
        throw error;
    }
}

module.exports = { dbconnect };