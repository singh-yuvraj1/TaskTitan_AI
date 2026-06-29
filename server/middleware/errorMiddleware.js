// Middleware to handle 444 / 404 Route Not Found errors
export const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Centralized error handling middleware
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  
  console.error('[SERVER MIDDLEWARE ERROR]:', err.stack || err.message);

  res.json({
    success: false,
    message: err.message || 'An unexpected server error occurred.',
    data: null,
    errors: [
      {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    ]
  });
};
