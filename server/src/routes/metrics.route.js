import { Router } from "express";
import { metricsCollector } from "../middlewares/metrics.middleware.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = Router();


// 관리자 전용 보호
router.use(authenticate, authorize("ADMIN"));


router.get("/", (req, res) => {
  const metrics = metricsCollector.getMetrics();
  res.status(200).json(metrics);
});

router.post("/reset", (req, res) => {
  metricsCollector.reset();
  res.status(200).json({ message: "메트릭이 초기화되었습니다." });
});

export default router;
