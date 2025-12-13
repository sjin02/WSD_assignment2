import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  getMyCart,
  addCartItem,
  updateCartItemQty,
  deleteCartItem,
  clearMyCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getMyCart);
router.post("/items", addCartItem);
router.patch("/items/:itemId", updateCartItemQty);
router.delete("/items/:itemId", deleteCartItem);
router.delete("/", clearMyCart);

export default router;
