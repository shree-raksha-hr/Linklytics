// routes/index.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const urlController = require('../controllers/urlController');

// Home page - public access
router.get('/', (req, res) => {
  res.render('index', { title: 'URL Shortener' });
});

// Dashboard - protected route
router.get('/dashboard', auth, urlController.getUserUrls);

// Redirect to original URL
router.get('/:shortId', urlController.redirectToOriginalUrl);

module.exports = router;