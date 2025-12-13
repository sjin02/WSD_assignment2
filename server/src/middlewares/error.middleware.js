export function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  res.status(status).json({
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    status,
    code: err.code || "INTERNAL_ERROR",
    message: err.message || "서버 오류",
    details: err.details || null,
  });
}

export default errorHandler;