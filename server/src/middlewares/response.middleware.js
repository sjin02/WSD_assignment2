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
    code = "BAD_REQUEST",
    details,
  ) => {
    const payload = {
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
      status: statusCode,
      code,
      message,
    };

    if (details) {
      payload.details = details;
    }

    return res.status(statusCode).json(payload);
  };

 
  next();
};

export default responseMiddleware;