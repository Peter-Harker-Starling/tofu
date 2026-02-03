require('dotenv').config();
const jwt = require('jsonwebtoken')

function jwtauth(req, res, next) {
  const token = req.cookies.admin_token;

  if (!token) {
    return res.redirect('/users/login');
  };

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = jwtauth;