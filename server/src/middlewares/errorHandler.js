export const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    status: err.status || 500,
    code: err.code || "INTERNAL_ERROR",
    message: err.message,
    details: err.details || null
  });
};
