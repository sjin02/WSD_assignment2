export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.fail("인증 필요", 401, "UNAUTHORIZED");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.fail("권한 없음", 403, "FORBIDDEN");
    }

    next();
  };
}
