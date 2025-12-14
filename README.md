# Bookstore API

## 프로젝트 개요

온라인 서점(Bookstore)을 위한 REST API 서버입니다.  
사용자 인증, 도서 조회/관리, 장바구니, 주문, 리뷰, 찜 기능을 제공합니다.

---

## 주요 기능

- 회원가입 / 로그인 / 로그아웃 / 토큰 갱신
- 도서 목록 조회, 상세 조회, 검색, 리뷰
- 장바구니 담기 / 수정 / 삭제
- 주문 생성 / 조회 / 취소
- 사용자 권한(USER / ADMIN) 기반 접근 제어
- Swagger API 문서 제공
- Health Check 엔드포인트 제공

---

## 실행 방법

### 로컬 실행

```bash
npm install
npx prisma migrate deploy
npx prisma db seed
npm run dev
```

---

## 환경 변수 설명 (.env)

```
DATABASE_URL=postgresql://user:password@localhost:5432/bookstore
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=8080
```

---

## 배포 주소 (JCloud)

- Base URL: http://<PUBLIC_IP>:<PORT>
- Swagger: http://<PUBLIC_IP>:<PORT>/api-docs
- Health: http://<PUBLIC_IP>:<PORT>/health

---

## 인증 플로우

1. 로그인 시 AccessToken / RefreshToken 발급
2. AccessToken → Authorization 헤더 사용
3. 만료 시 RefreshToken으로 재발급
4. 로그아웃 시 RefreshToken 폐기

---

## 역할 / 권한

| API       | USER | ADMIN |
| --------- | ---- | ----- |
| 도서 조회 | O    | O     |
| 도서 생성 | X    | O     |
| 주문      | O    | O     |
| 유저 관리 | X    | O     |

---

## 예제 계정

- user1@test.com / password123
- admin@test.com / password123

---

## DB 정보 (테스트용)

- DB: PostgreSQL
- Port: 5432
- ORM: Prisma

---

## 엔드포인트 요약

- POST /auth/login
- POST /auth/refresh
- GET /books
- POST /orders
- GET /health

---

## 보안 및 성능

- JWT 인증
- Rate Limit 적용
- DB Index 활용

---

## 한계 및 개선

- 결제 연동 미구현
- 캐싱 미적용
- 관리자 기능 확장 가능
