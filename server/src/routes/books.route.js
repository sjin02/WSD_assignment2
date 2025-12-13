import { Router } from 'express';
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import {
  getBooksController, 
  getBookByIdController, 
  getReviews, 
  getStats,
  createBookController,
  updateBookController,
  deleteBookController
 } from '../controllers/books.controller.js';
import { createReviewController } from '../controllers/reviews.controller.js';
import { addFavoriteController, removeFavoriteController } from '../controllers/favorites.controller.js';  

const router = Router();

router.get("/", getBooksController);
router.get("/:id", getBookByIdController);
// router.get("/:id/reviews", getReviews);
router.get("/:id/stats", getStats);

router.post("/", authenticate, authorize("SELLER", "ADMIN"), createBookController);
router.patch("/:id", authenticate, authorize("SELLER", "ADMIN"), updateBookController);
router.delete("/:id", authenticate, authorize("SELLER", "ADMIN"), deleteBookController);

// 리뷰관련 routes
router.post("/:id/reviews", authenticate, createReviewController);
router.get("/:id/reviews", getReviews);

// 찜 관련 routes
router.post("/:id/favorite", authenticate, addFavoriteController);
router.delete("/:id/favorite", authenticate, removeFavoriteController);


export default router;