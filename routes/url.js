// routes/url.js
const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');
const { validateUrl } = require('../middleware/validateUrl');
const auth = require('../middleware/auth');

// Shorten URL - public access
router.post('/shorten', validateUrl, urlController.shortenUrl);

// Shorten URL - authenticated user
router.post('/shorten/auth', auth, validateUrl, urlController.shortenUrl);

// Delete URL - authenticated user only
router.delete('/:id', auth, urlController.deleteUrl);

// Alternative route for delete that works with forms
router.post('/delete/:id', auth, urlController.deleteUrl);

// Generate QR code for URL - authenticated user only
router.get('/qrcode/:id', auth, urlController.generateQrCode);

module.exports = router;