// controllers/urlController.js
const { nanoid } = require('nanoid');
const Url = require('../models/Url');
const qrcode = require('qrcode');

// Helper function to validate custom alias
const isValidCustomAlias = (alias) => {
  const validPattern = /^[a-zA-Z0-9_-]+$/;
  return validPattern.test(alias) && alias.length >= 3 && alias.length <= 20;
};

// Helper function to get expiration date based on option
const getExpirationDate = (expiryOption) => {
  if (!expiryOption || expiryOption === 'never') return null;
  
  const now = new Date();
  switch (expiryOption) {
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case '1d':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case '7d':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case '30d':
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
};

// Shorten URL
exports.shortenUrl = async (req, res) => {
  try {
    const { originalUrl, customAlias, expiryOption } = req.body;
    
    // Check if there are validation errors from middleware
    if (req.validationErrors) {
      if (req.user) {
        return res.render('dashboard', { 
          errors: req.validationErrors,
          originalUrl,
          customAlias
        });
      } else {
        return res.render('index', { 
          errors: req.validationErrors,
          originalUrl,
          customAlias
        });
      }
    }

    let shortId;
    let isCustom = false;

    // Handle custom alias if provided
    if (customAlias && customAlias.trim() !== '') {
      const trimmedAlias = customAlias.trim();
      
      // Validate custom alias format
      if (!isValidCustomAlias(trimmedAlias)) {
        const error = { msg: 'Custom alias must be 3-20 characters and contain only letters, numbers, hyphens, and underscores' };
        if (req.user) {
          return res.render('dashboard', { 
            errors: [error],
            originalUrl,
            customAlias
          });
        } else {
          return res.render('index', { 
            errors: [error],
            originalUrl,
            customAlias
          });
        }
      }
      
      // Check if the custom alias is already in use
      const existingUrl = await Url.findOne({ shortId: trimmedAlias });
      if (existingUrl) {
        const error = { msg: 'This custom alias is already in use. Please choose another one.' };
        if (req.user) {
          return res.render('dashboard', { 
            errors: [error],
            originalUrl,
            customAlias
          });
        } else {
          return res.render('index', { 
            errors: [error],
            originalUrl,
            customAlias
          });
        }
      }
      
      shortId = trimmedAlias;
      isCustom = true;
    } else {
      // Generate a short ID if no custom alias is provided
      shortId = nanoid(7);
    }
    
    // Get expiration date if option is provided
    const expiresAt = getExpirationDate(expiryOption);
    
    // Create new URL document
    const url = new Url({
      originalUrl,
      shortId,
      owner: req.user ? req.user.id : null,
      expiresAt,
      isCustom
    });

    await url.save();

    // Format for response
    const shortUrl = `${process.env.BASE_URL}/${shortId}`;
    
    // Generate QR code
    const qrCodeDataURL = await qrcode.toDataURL(shortUrl);
    
    if (req.user) {
      // If user is logged in, redirect to dashboard
      return res.redirect('/dashboard');
    } else {
      // If anonymous user, show on homepage
      return res.render('index', {
        title: 'URL Shortener',
        shortUrl,
        originalUrl,
        customAlias,
        qrCodeDataURL
      });
    }
  } catch (err) {
    console.error('Error shortening URL:', err);
    const errorMsg = 'Error shortening URL';
    
    if (req.user) {
      return res.render('dashboard', { 
        errors: [{ msg: errorMsg }],
        originalUrl: req.body.originalUrl,
        customAlias: req.body.customAlias
      });
    } else {
      return res.render('index', { 
        errors: [{ msg: errorMsg }],
        originalUrl: req.body.originalUrl,
        customAlias: req.body.customAlias
      });
    }
  }
};

// Redirect to original URL
exports.redirectToOriginalUrl = async (req, res) => {
  try {
    const url = await Url.findOne({ shortId: req.params.shortId });
    
    if (!url) {
      return res.status(404).render('error', { 
        message: 'URL not found'
      });
    }
    
    // Check if URL has expired
    if (url.expiresAt && new Date() > new Date(url.expiresAt)) {
      return res.status(410).render('error', { 
        message: 'This URL has expired'
      });
    }

    // Increment click count
    url.clicks++;
    await url.save();
    
    // Redirect to original URL
    return res.redirect(url.originalUrl);
  } catch (err) {
    console.error('Error redirecting:', err);
    res.status(500).render('error', { 
      message: 'Error redirecting to URL'
    });
  }
};

// Get all URLs for logged in user
exports.getUserUrls = async (req, res) => {
  try {
    const urls = await Url.find({ owner: req.user.id }).sort({ createdAt: -1 });
    
    // Generate QR codes for each URL
    const urlsWithQR = await Promise.all(urls.map(async (url) => {
      const shortUrl = `${process.env.BASE_URL}/${url.shortId}`;
      const qrCodeDataURL = await qrcode.toDataURL(shortUrl);
      
      // Convert Mongoose document to plain object
      const urlObj = url.toObject();
      urlObj.shortUrl = shortUrl;
      urlObj.qrCodeDataURL = qrCodeDataURL;
      
      return urlObj;
    }));
    
    res.render('dashboard', {
      title: 'Dashboard',
      urls: urlsWithQR
    });
  } catch (err) {
    console.error('Error fetching user URLs:', err);
    res.render('dashboard', {
      title: 'Dashboard',
      errors: [{ msg: 'Error fetching your URLs' }]
    });
  }
};

// Delete URL
exports.deleteUrl = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    
    // Check if URL exists
    if (!url) {
      return res.status(404).json({ success: false, msg: 'URL not found' });
    }
    
    // Check if user owns the URL
    if (url.owner && url.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, msg: 'Not authorized' });
    }
    
    await url.remove();
    
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error deleting URL:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
};

// Generate QR code for a specific URL
exports.generateQrCode = async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);
    
    // Check if URL exists
    if (!url) {
      return res.status(404).json({ success: false, msg: 'URL not found' });
    }
    
    // Check if user owns the URL
    if (url.owner && url.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, msg: 'Not authorized' });
    }
    
    const shortUrl = `${process.env.BASE_URL}/${url.shortId}`;
    const qrCodeDataURL = await qrcode.toDataURL(shortUrl);
    
    res.json({ success: true, qrCodeDataURL });
  } catch (err) {
    console.error('Error generating QR code:', err);
    res.status(500).json({ success: false, msg: 'Server error' });
  }
};