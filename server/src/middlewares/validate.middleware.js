export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    return next({
      statusCode: 422,
      code: "UNPROCESSABLE_ENTITY",
      message: "입력값 검증 실패",
      details: result.error.flatten(),
    });
  }

  req.body = result.data;
  next();
};
