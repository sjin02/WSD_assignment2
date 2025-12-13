import { Router } from "express";
import { login, refresh, logout } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, refreshSchema } from "../dtos/auth.dto.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshSchema), refresh);
router.post("/logout", authenticate, logout);

export default router;