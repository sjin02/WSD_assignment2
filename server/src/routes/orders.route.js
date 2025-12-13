import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createOrder,
  listMyOrders,
  getMyOrder,
  cancelOrder,
} from "../controllers/orders.controller.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createOrder);
router.get("/", listMyOrders);
router.get("/:id", getMyOrder);
router.post("/:id/cancel", cancelOrder);

export default router;
