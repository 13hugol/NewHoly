const { dbconnect } = require('./dbconnect');

const check = async (req, res, next) => {
  try {
    const db = await dbconnect();
    const coll = db.collection('students');

    const { name, contact } = req.body;

    // Check if either the name or the contact already exists
    const existingStudent = await coll.findOne({
      $or: [{ name: name }, { contact: contact }]
    });

    if (existingStudent) {
      // Redirect with failure status if duplicate found
      return res.redirect('/index.html?status=failed');
    }

    // No duplicates, proceed to next middleware/route handler
    next();
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, block the request gracefully
    return res.status(500).send('Internal Server Error');
  }
};

module.exports = { check };
