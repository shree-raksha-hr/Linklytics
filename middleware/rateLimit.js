// middleware/rateLimit.js
const rateLimit = require('express-rate-limit');

// Create rate limiter for URL shortening
const shortenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many URL shortening requests, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create rate limiter for authentication attempts
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 failed login attempts per hour
  message: 'Too many login attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // don't count successful logins
});

module.exports = {
  shortenLimiter,
  authLimiter
};