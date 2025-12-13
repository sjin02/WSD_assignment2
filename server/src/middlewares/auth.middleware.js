import jwt from "jsonwebtoken";

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw {
      status: 401,
      code: "NO_TOKEN",
      message: "인증 토큰이 필요합니다",
    };
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role }
    next();
  } catch {
    throw {
      status: 401,
      code: "INVALID_TOKEN",
      message: "유효하지 않은 토큰",
    };
  }
}
