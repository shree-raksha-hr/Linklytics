// routes/auth.js
const express = require('express');
const { check } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

// Register routes
router.get('/register', authController.getRegister);

router.post('/register', [
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  check('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  check('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
], authController.postRegister);

// Login routes
router.get('/login', authController.getLogin);

router.post('/login', [
  check('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),
  check('password')
    .trim()
    .notEmpty().withMessage('Password is required')
], authController.postLogin);

// Logout route
router.get('/logout', authController.getLogout);

module.exports = router;