const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const indexRoutes = require('./routes/index');
const urlRoutes = require('./routes/url');
const authRoutes = require('./routes/auth');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { shortenLimiter, authLimiter } = require('./middleware/rateLimit');

// Import database configuration
const connectDB = require('./config/db');

// Initialize app
const app = express();

// Connect to database
connectDB();

// Set up view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com'],
    }
  }
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// Make user data available to all templates
app.use((req, res, next) => {
  res.locals.currentUser = req.cookies.token ? true : false;
  next();
});

// Apply rate limiting to specific routes
app.use('/url/shorten', shortenLimiter);
app.use('/auth/login', authLimiter);

// Routes
app.use('/', indexRoutes);
app.use('/url', urlRoutes);
app.use('/auth', authRoutes);

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).render('error', { 
    title: 'Not Found',
    message: 'Page not found' 
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;