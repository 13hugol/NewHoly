const express= require('express');
const app= express();
app.use(express.json());
const { dbconnect } = require('./dbconnect');

let check = async (req, res, next) => {
  let db = await dbconnect();
  let coll = db.collection('students');
  let name = req.body.name;
    let number= req.body.contact;
  // Check if a student with the same name already exists
  let existing_name = await coll.findOne({ name: name });
    let existing_number= await coll.findOne({ contact:number});
  if (existing_name&&existing_number) {
    return res.redirect('/index.html?status=failed');
  }
  next();
};

module.exports={check};