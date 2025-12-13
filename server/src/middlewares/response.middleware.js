const responseMiddleware = (req, res, next) => {
  res.success = (data = {}, statusCode = 200) => {
    return res.status(statusCode).json({
      status: "success",
      data,
    });
  };

  res.fail = (message = "Bad Request", statusCode = 400, code = "ERROR") => {
    return res.status(statusCode).json({
      status: "fail",
      message,
      code,
    });
  };
 
  next();
};

export default responseMiddleware;