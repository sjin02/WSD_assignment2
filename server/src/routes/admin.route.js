import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();

router.get(
  "/dashboard",
  authenticate,
  authorize("ADMIN"),
  (req, res) => {
    res.success({ message: "관리자 대시보드 접근 성공" });
  }
);

export default router;
