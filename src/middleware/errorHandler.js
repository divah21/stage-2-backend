export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: 'Route not found'
  });
}
