import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/auth.route.js";
import booksRouter from "./routes/books.route.js";
import usersRouter from "./routes/users.route.js";
import adminRouter from "./routes/admin.route.js";
import responseMiddleware from "./middlewares/response.middleware.js";
import errorHandler  from "./middlewares/error.middleware.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // React 주소
  credentials: true
}));
app.use(express.json());
app.use(morgan("dev"));
app.use(responseMiddleware);

app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/books", booksRouter);

// 헬스 체크
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use(errorHandler);

// //  책 목록 API 추가
// app.get("/books", (req, res) => {
//   const sampleBooks = [
//     { id: 1, title: "해리포터", author: "롤링", price: 15000 },
//     { id: 2, title: "나미야 잡화점", author: "히가시노 게이고", price: 14000 },
//     { id: 3, title: "미움받을 용기", author: "기시미 이치로", price: 13000 }
//   ];

//   res.json(sampleBooks);
// });

export default app;
