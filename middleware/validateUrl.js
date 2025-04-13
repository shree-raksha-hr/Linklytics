// middleware/validateUrl.js
const { check, validationResult } = require('express-validator');

// Middleware to validate URL
exports.validateUrl = [
  check('originalUrl')
    .trim()
    .notEmpty().withMessage('URL is required')
    .isURL().withMessage('Please enter a valid URL'),
  
  check('customAlias')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('Custom alias must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),
  
  check('expiryOption')
    .optional()
    .isIn(['never', '1h', '1d', '7d', '30d']).withMessage('Invalid expiration option'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // If it's a regular form submission, pass errors to the next middleware
      req.validationErrors = errors.array();
      return next();
    }
    
    next();
  }
];