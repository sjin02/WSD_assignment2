import { Router } from 'express';
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  updateReviewController,
  deleteReviewController
} from '../controllers/reviews.controller.js';

const router = Router();

router.patch("/:id", authenticate, updateReviewController);
router.delete("/:id", authenticate, deleteReviewController);

export default router;