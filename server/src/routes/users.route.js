import { Router } from "express";
import { signup, getMe, updateMe, deleteMe } from "../controllers/users.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { signupSchema, updateUserSchema } from "../dtos/user.dto.js";
import { getMyReviewsController } from "../controllers/reviews.controller.js";
import { getMyFavoritesController } from "../controllers/favorites.controller.js";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, validate(updateUserSchema), updateMe);
router.delete("/me", authenticate, deleteMe);

// 리뷰 관련 route
router.get("/me/reviews", authenticate, getMyReviewsController);

// 찜 관련 route
router.get("/me/favorites", authenticate, getMyFavoritesController);

export default router;
