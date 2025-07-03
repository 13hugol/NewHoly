const express= require('express');
const app= express();
app.use(express.json());
const { dbconnect } = require('./dbconnect');

let check= async(req,res,next)=>{
    let db =await dbconnect();
    let coll=db.collection('students');
}