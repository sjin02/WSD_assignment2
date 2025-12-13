import app from "./app.js";

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`서버는 ${PORT}번 포트에서 실행 중입니다.`));
