import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as usersController from "./users.controller.js";
const router = Router();

router.get("/", asyncHandler(usersController.getUsers));
router.get("/:id", asyncHandler(usersController.getUser));

export default router;
