import { Router } from "express";
import { signup, getMe, updateMe, softDeleteUser } from "../controllers/users.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { signupSchema, updateUserSchema } from "../dtos/user.dto.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, validate(updateUserSchema), updateMe);

// 관리자만 회원 정지
router.delete("/:id", authenticate, authorize("ADMIN"), softDeleteUser);

export default router;
