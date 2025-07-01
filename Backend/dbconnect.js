const {MongoClient}= require('mongodb');
const url='mongodb://127.0.0.1:27017';
let client= new MongoClient(url);

let dbconnect=async()=>{
   await client.connect();
   return client.db('newholy');
}
module.exports={dbconnect};