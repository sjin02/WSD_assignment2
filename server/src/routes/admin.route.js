import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";
import { getAllUsers, softDeleteUser, updateUserByAdmin} from "../controllers/admin.controller.js";
const router = Router();

// 관리자 전용 공통 보호
router.use(authenticate, authorize("ADMIN"));

router.get("/users", getAllUsers);
router.delete("/users/:id", softDeleteUser);
router.patch("/users/:id", authenticate, authorize("ADMIN"), updateUserByAdmin);

export default router;
