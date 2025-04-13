// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    console.error(err.stack);
    
    // Determine status code
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Set status
    res.status(statusCode);
    
    // Check if request expects JSON response
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
      return res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : null
      });
    }
    
    // Render error page
    res.render('error', {
      title: 'Error',
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err : {}
    });
  };
  
  module.exports = errorHandler;