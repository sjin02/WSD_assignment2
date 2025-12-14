# Architecture

Express + Prisma + PostgreSQL

## 런타임 구성

- **Express 애플리케이션**: `src/app.js`에서 CORS, JSON/URL-encoded 파서, morgan 로거, 공용 라우터용 rate limit, 응답 표준화 미들웨어, 메트릭 수집기를 설정한 뒤 도메인별 라우터를 장착한다.

- **Swagger UI**: `swagger-jsdoc`로 생성한 스펙을 `/api-docs`에 마운트하여 현재 OpenAPI 명세(`docs/openapi.yaml`)를 노출한다.

- **서버 부트스트랩**: `src/server.js`가 환경 변수 `PORT`(기본 8080)로 서버를 기동하고 `0.0.0.0`에 바인딩한다.

## 계층 구조

- **라우트 → 컨트롤러 → 서비스 → Prisma**: `src/routes`에서 HTTP 경로를 정의하고, 요청은 컨트롤러(`src/controllers`)로 위임된다. 컨트롤러는 DTO(Zod 스키마) 검증을 거쳐 서비스(`src/services`)를 호출하며, 데이터 접근은 Prisma Client가 `src/prisma/schema.prisma`를 기반으로 담당한다.

- **DTO & 미들웨어**: `src/dtos`의 Zod 스키마로 입력 검증(`validate.middleware`)을 수행하고, `auth.middleware`로 JWT 인증을 처리한다. 응답 포맷은 `response.middleware`가 `res.success/res.fail` 헬퍼를 부여해 일관성을 유지한다.

- **공통 유틸/관심사**: 메트릭(`metrics.middleware`)은 요청/에러/지연시간을 집계하며 `/metrics`·`/metrics/reset` 라우터에서 조회/초기화된다. 오류는 `error.middleware`에서 최종 처리된다.

## 도메인 라우팅

- **인증/사용자**: `/auth` 라우터가 로그인·토큰 갱신·로그아웃을, `/users` 라우터가 가입·내 정보·내 리뷰/찜 조회를 담당한다.

- **도서/리뷰/찜**: `/books` 라우터가 목록/상세/등록/수정/삭제/통계를 처리하고, `/reviews` 라우터가 리뷰 수정·삭제를 제공한다. 도서 찜은 `/books/{id}/favorite` 경로로 처리된다.

- **장바구니/주문**: `/cart` 라우터가 장바구니 조회/초기화 및 아이템 추가·수정·삭제를, `/orders` 라우터가 주문 생성·조회·취소를 제공한다.

- **관리자/운영**: `/admin` 라우터는 사용자·주문 관리 기능을, `/health`와 `/metrics` 라우터는 운영 모니터링 엔드포인트를 제공한다.
