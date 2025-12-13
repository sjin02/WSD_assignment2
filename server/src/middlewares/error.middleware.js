export default function errorHandler(err, req, res, next) {
  console.error(err);

  // Zod validation 에러
  if (err.name === "ZodError") {
    return res.status(422).json({
      timestamp: new Date().toISOString(),
      status: "fail",
      code: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: err.errors,
    });
  }

  // 기본 서버 에러
  return res.status(500).json({
    timestamp: new Date().toISOString(),
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: err.message || "Unexpected error",
  });
}
