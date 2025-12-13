import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";
import booksRouter from "./routes/books.route.js";
import usersRouter from "./routes/users.route.js";
import adminRouter from "./routes/admin.route.js";
import responseMiddleware from "./middlewares/response.middleware.js";
import errorHandler  from "./middlewares/error.middleware.js";
import rateLimit from "express-rate-limit";
import reviewsRouter from "./routes/review.route.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // React 주소
  credentials: true
}));
app.use(express.json({ limit: "1mb" })); // JSON 요청 바디 파싱, 최대 크기 1MB
app.use(express.urlencoded({ extended: true })); // URL-encoded 요청 바디 파싱
app.use(morgan("dev"));
app.use(responseMiddleware);

// 공용 라우터에 대한 속도 제한 설정
const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100,                // IP당 100회
});

app.use("/auth", publicLimiter);

// 라우터
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/books", booksRouter);
app.use("/reviews", reviewsRouter);

// 헬스 체크
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    version: "1.0.0",
    buildTime: process.env.BUILD_TIME || "local",
    uptime: process.uptime()
  });
});


app.use(errorHandler);


export default app;
