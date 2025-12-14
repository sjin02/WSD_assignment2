# Architecture

Express + Prisma + PostgreSQL

# Architecture

Express + Prisma + PostgreSQL

### 개요

온라인 서점(Bookstore) API 서버의 전체 아키텍처와 설계 원칙을 정리한다. 본 서비스는 Express + Prisma 기반으로 JWT 인증을 사용하며, 요청/응답 규격과 모니터링을 일관되게 적용한다.

## 전체 아키텍처
Client
(Postman / Swagger / Web / App)
        │  HTTP (REST)
        ▼
Express Server (Node.js)
 ├─ Security
 │   - JWT 인증
 │   - Rate Limit
 │
 ├─ Controller
 │   - 요청/응답 처리
 │   - 유효성 검증
 │
 ├─ Service
 │   - 비즈니스 로직
 │   - 트랜잭션 처리
 │
 └─ Data Access
     - Prisma Client
     - DB CRUD
        │
        ▼
PostgreSQL


## 계층별 구조

### 1. Controller (Presentation Layer)

- 역할: HTTP 요청/응답 처리, 입력 검증, 상태 코드 설정.
- 위치: `src/controllers/*` 와 `src/routes/*` (라우팅 테이블).
- 책임:
  - REST 엔드포인트 정의 → Zod 스키마 기반 DTO 검증(`middlewares/validate.middleware`).
  - JWT 인증 미들웨어(`middlewares/auth.middleware`) 적용 여부 결정.
  - 서비스 호출 결과를 표준 응답 헬퍼(`response.middleware`의 `res.success/res.fail`)로 반환.

### 2. Service (Business Layer)

- 역할: 도메인 규칙 구현, 트랜잭션 단위 작업 조합.
- 위치: `src/services/*`.
- 책임:
  - 여러 리포지토리(Prisma 호출) 조합 및 입력 검증 후 비즈니스 로직 실행.
  - 암호화/검증(bcrypt), 재고/수량 계산, 에러 코드 표준화.
  - 필요한 경우 eager loading 옵션(include/select)으로 N+1 방지.
- 예시 (`services/orders.service.js`): 장바구니 품목을 합산하고 주문/주문아이템을 한 트랜잭션으로 생성.

### 3. Data Access Layer (Prisma)

- 역할: DB CRUD 및 관계 로딩.
- 위치: `src/prisma/schema.prisma` (모델) + Prisma Client 호출부(`services/*`).
- 책임:
  - `prisma.<model>.findMany/create/update` 등으로 데이터베이스 접근.
  - `include`/`select`로 필요한 관계만 조회하여 쿼리 수 최소화.
  - `P2025` 등 Prisma 오류 코드를 비즈니스 에러로 변환.

### 4. Domain Model / DTO

- 역할: 도메인 스키마 및 요청/응답 DTO 정의.
- 위치: `src/dtos/*`, `src/prisma/schema.prisma`.
- 책임:
  - Zod 스키마로 입력 유효성 보장, Prisma 모델로 저장 스키마 규정.
  - 클라이언트 노출 필드와 내부 필드를 분리(비밀번호 해시 등 제외).

### 5. 공통 인프라 레이어

- 미들웨어: `response.middleware`(응답 표준화), `metrics.middleware`(지표), `error.middleware`(예외 변환), `validate.middleware`(스키마 검증).
- 모니터링: `/metrics`·`/metrics/reset` 및 `monitoring-dashboard.html`로 간단한 대시보드 제공.
- 문서화: `swagger.js` + `docs/openapi.yaml`로 `/api-docs`에 OpenAPI 제공.

## 패키지 구조

```
src/
├── app.js                     # Express 부트스트랩(CORS, logger, rate limit, routers)
├── server.js                  # 서버 시작 (PORT=8080 기본)
├── routes/                    # 도메인별 라우터(auth, users, books, reviews, cart, orders, admin, metrics)
├── controllers/               # 라우터에서 위임받는 프리젠테이션 로직
├── services/                  # 도메인 서비스 (auth, book, cart, order 등)
├── dtos/                      # Zod 기반 요청/응답 스키마
├── middlewares/               # auth, validate, response, metrics, error 등 공통 미들웨어
├── prisma/                    # schema.prisma, seed 스크립트, Prisma Client 설정
├── utils/                     # JWT 발급/검증, 비밀번호 해시 등 공통 유틸
└── monitoring-dashboard.html  # 메트릭 뷰어
```

## 보안 아키텍처

### JWT 인증 플로우

1. 로그인(`POST /auth/login`): 이메일/비밀번호 검증 후 Access/Refresh 토큰 발급(`utils/jwt`).
2. 클라이언트는 이후 요청 헤더에 `Authorization: Bearer {accessToken}` 포함.
3. `auth.middleware.authenticate`가 토큰 유효성 검사 → `req.user`에 클레임 주입.
4. 컨트롤러/서비스는 `req.user` 기반 권한 판단(예: 내 정보, 주문 생성 등).
5. 토큰 만료 시 401을 반환하며, `/auth/refresh`에서 재발급.

### Express 미들웨어 체인

- `cors` → `express.json/urlencoded` → `morgan` → `metricsMiddleware` → `responseMiddleware` → `express-rate-limit`(공용) → 라우터 → `error.middleware`.
- `/api-docs`, `/books`, `/health` 등 공용 엔드포인트에 속도 제한 적용.

## 데이터 플로우

### 조회 요청 (Read)

Client
↓ `GET /books?page=1&limit=10`
Route/Controller (`books.route` → `books.controller`)
↓ 스키마 검증(Zod) + 인증 여부 확인
Service (`book.service`)
↓ Prisma `findMany` + `include`로 관계 조회
Prisma → PostgreSQL
↑ 결과 레코드
Service
↑ DTO 매핑 + 페이지네이션 정보
Controller
↑ `res.success` 응답(JSON)
Client

### 생성 요청 (Create)

Client
↓ `POST /orders` + payload
Route/Controller (`orders.route` → `orders.controller`)
↓ 인증 미들웨어 + 입력 검증
Service (`orders.service`)
↓ 카트/도서 재고 확인 후 Prisma 트랜잭션으로 Order/OrderItem 생성
Prisma → PostgreSQL (COMMIT)
↑ 생성 결과
Controller
↑ `res.success`(201 Created)
Client

## 예외 처리 전략

- `error.middleware`에서 모든 에러를 최종 처리.
  - 비즈니스 에러: `{status, code, message, details}` 형태로 변환.
  - 검증 오류(Zod/422): `UNPROCESSABLE_ENTITY` 코드로 422 응답.
  - Prisma P2025 → 404, 기타 Prisma 오류 → 500 `DATABASE_ERROR`.
  - 최종 Fallback → 500 `INTERNAL_SERVER_ERROR`.
- 로깅: `console.error` + `morgan`(요청 로깅).

## 성능/운영 고려사항

1. Rate Limiting: `express-rate-limit`로 `/auth`, `/books`, `/health` 등 공용 경로 보호(15분 100회).
2. N+1 방지: Prisma `include`/`select` 사용, 필요한 관계만 eager loading.
3. Pagination: 목록 엔드포인트에서 `page/limit` 파라미터로 페이지네이션 지원.
4. 모니터링: `metrics.middleware`로 요청/지연/에러 집계, `/metrics`에서 확인.

## 설정 관리

- 환경 변수 (`.env`): `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `PORT` 등.
- Prisma 설정: `prisma/schema.prisma` + `npx prisma migrate deploy`로 마이그레이션 적용.

Deployment Architecture (Jcloud)

## 배포 아키텍처 

Jcloud Server (Linux)
 ├─ API Server (Node.js)
 │   - pm2로 실행
 │   - Port: 8080
 │
 ├─ PostgreSQL
 │   - Jcloud DB 또는 Managed DB
 │
 └─ Monitoring / Logs
     - pm2 monit
     - server logs

- 배포 흐름: `git pull` → `npm ci` → `npx prisma migrate deploy` → `pm2 restart api`.
- 환경 변수는 Jcloud 서버의 쉘 프로파일 혹은 `.env` 파일로 관리.
- PM 프로세스는 재시작 정책(`--watch` 또는 `pm2 restart api`)으로 장애 시 자동 복구.
