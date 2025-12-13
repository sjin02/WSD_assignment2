export default function errorHandler(err, req, res, next) {
  console.error(err);

  // 1. 표준 비즈니스 에러
  // service/controller에서 의도적으로 throw한 에러
  if (err.status && err.code) {
    return res.status(err.status).json({
      timestamp: new Date().toISOString(),
      status: err.status >= 500 ? "error" : "fail",
      code: err.code,
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // 2. 사전 처리된 validation 에러
  if (
    err.statusCode === 422 ||
    err.status === 422 ||
    err.code === "UNPROCESSABLE_ENTITY"
  ) {
    return res.status(422).json({
      timestamp: new Date().toISOString(),
      status: "fail",
      code: "UNPROCESSABLE_ENTITY",
      message: err.message || "Unprocessable entity",
      details: err.details,
    });
  }

  // 3. Zod validation 에러
  if (err.name === "ZodError") {
    return res.status(422).json({
      timestamp: new Date().toISOString(),
      status: "fail",
      code: "UNPROCESSABLE_ENTITY",
      message: "Invalid request data",
      details: err.errors,
    });
  }

  // 4. Prisma not found
  if (err.code === "P2025") {
    return res.status(404).json({
      timestamp: new Date().toISOString(),
      status: "fail",
      code: "RESOURCE_NOT_FOUND",
      message: err.meta?.cause || "Resource not found",
    });
  }

  // 5. Prisma(DB) 관련 에러
  if (err.code?.startsWith?.("P")) {
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      status: "error",
      code: "DATABASE_ERROR",
      message: err.message || "Database error",
    });
  }

  // 6. 기본 서버 에러 (최종 fallback)
  return res.status(500).json({
    timestamp: new Date().toISOString(),
    status: "error",
    code: "INTERNAL_SERVER_ERROR",
    message: err.message || "Unexpected error",
  });
}
