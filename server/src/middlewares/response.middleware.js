const responseMiddleware = (req, res, next) => {
  res.success = (data = {}, statusCode = 200, message = null) => {
    return res.status(statusCode).json({
      status: "success",
      message,
      data,
    });
  };

  res.fail = (
    message = "Bad Request",
    statusCode = 400,
    code = "ERROR",
  ) => {
    return res.status(statusCode).json({
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      status: statusCode,
      code,
      message
    });
  };

 
  next();
};

export default responseMiddleware;