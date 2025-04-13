// controllers/authController.js
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// Display register form
exports.getRegister = (req, res) => {
  res.render('auth/register', { title: 'Register' });
};

// Process register form
exports.postRegister = async (req, res) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render('auth/register', {
        title: 'Register',
        errors: errors.array(),
        user: req.body
      });
    }

    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.render('auth/register', {
        title: 'Register',
        errors: [{ msg: 'User already exists' }],
        user: req.body
      });
    }

    // Create new user
    user = new User({
      username,
      email,
      password
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour
    });

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Registration error:', err);
    res.render('auth/register', {
      title: 'Register',
      errors: [{ msg: 'Server error, please try again' }],
      user: req.body
    });
  }
};

// Display login form
exports.getLogin = (req, res) => {
  res.render('auth/login', { title: 'Login' });
};

// Process login form
exports.postLogin = async (req, res) => {
  try {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.render('auth/login', {
        title: 'Login',
        errors: errors.array(),
        user: req.body
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('auth/login', {
        title: 'Login',
        errors: [{ msg: 'Invalid credentials' }],
        user: req.body
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('auth/login', {
        title: 'Login',
        errors: [{ msg: 'Invalid credentials' }],
        user: req.body
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set token in cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hour
    });

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Login error:', err);
    res.render('auth/login', {
      title: 'Login',
      errors: [{ msg: 'Server error, please try again' }],
      user: req.body
    });
  }
};

// Logout
exports.getLogout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};