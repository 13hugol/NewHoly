const { MongoClient } = require('mongodb');
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

const dbconnect = async () => {
  await client.connect();
  const db = client.db('newholy');
  return db;
};
module.exports = {dbconnect};