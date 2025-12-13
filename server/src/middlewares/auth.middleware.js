import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.fail("인증 토큰이 필요합니다.", 401, "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.fail("토큰이 없습니다.", 401, "UNAUTHORIZED");
    }

    const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET);

    req.user = payload;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.fail("토큰이 만료되었습니다.", 401, "TOKEN_EXPIRED");
    }

    return res.fail("유효하지 않은 토큰입니다.", 401, "UNAUTHORIZED");
  }
};
