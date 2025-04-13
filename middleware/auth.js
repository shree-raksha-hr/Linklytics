// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from cookie or header
    const token = req.cookies.token || 
                  (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    if (!token) {
      return res.status(401).redirect('/auth/login');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user by id
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).redirect('/auth/login');
    }

    // Set user in request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    res.clearCookie('token');
    res.status(401).redirect('/auth/login');
  }
};