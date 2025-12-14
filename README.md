# Bookstore API

온라인 서점 서비스를 위한 EXPRESS기반 REST API 서버입니다.  
사용자/판매자/관리자 인증을 기반으로 도서 조회, 도서 관리, 구매, 리뷰, 찜, 장바구니, 주문 관리, 유저 관리 등의 기능을 제공합니다.

---

## 1. 프로젝트 개요

### 문제 정의

온라인 서점 서비스에서 필요한 핵심 기능(회원 관리, 도서 관리, 주문, 리뷰 등)을  
REST API 형태로 구현하고, 인증/인가, 테스트, 문서화까지 포함한 백엔드 서버를 구축합니다.
본 프로젝트는 Node.js 서버를 JCloud에 배포하였으며, PM을 사용해 서버 재시작 시에도 자동으로 실행되도록 설정하였습니다. 데이터베이스는 PostgreSQL을 사용합니다.
/server/docs폴더에 api-design, architecture, db-schema를 넣어두었습니다.

### 주요 기능

- JWT 기반 사용자 인증 (Access / Refresh Token)
- 역할 기반 권한 제어 (USER / SELLER / ADMIN)
- 도서 CRUD 및 검색, 페이지네이션, 필터, 정렬
- 장바구니, 주문 흐름
- 리뷰 및 찜 기능
- Swagger API 문서 자동화
- Jest + Supertest 자동화 테스트
- Postman 컬렉션 및 테스트 스크립트 제공
- 간단한 모니터링 메트릭 (/metrics)

---

## 2. 실행 방법

### 로컬 실행(Node.js)

#### 1) 의존성 설치

```bash
npm install
```

#### 2) 환경변수 설정

```
.env.example 파일을 복사하여 .env 생성
```

#### 3) DB 마이그레이션

```bash
npx prisma migrate deploy
```

#### 4) 초기 데이터 시드

```bash
npx prisma db seed
```

#### 5) 서버 실행

```bash
npm run dev
```

---

### Docker (권장하지 않음 – 과제 환경 제약)

> **주의**: VM 디스크 용량 제한으로 인해 Docker 빌드 중 `ENOSPC` 오류가 반복 발생할 수 있습니다.

```bash
docker compose up --build
```

### 추가점수 Docker 배포 구현

- postgres:16 컨테이너 정상 실행
- API 서버 컨테이너 빌드 및 실행 시도
- Dockerfile 기반 멀티 스테이지 빌드 구성
- Prisma Client 생성 및 DB 연결 설정 완료

그러나 JCloud 인스턴스 환경에서 다음과 같은 물리적 제약에 의해 API 컨테이너의 안정적인 실행이 어려운 상황이 발생함.

- 인스턴스 디스크 용량이 매우 제한적임
- Docker 이미지 빌드 과정에서
- Node.js 런타임
- node_modules
- Prisma engine
- npm 캐시
  등이 누적되어 디스크 공간 부족(ENOSPC) 오류 발생

docker system prune 등 정리 후에도 Prisma 및 Node 이미지 빌드 과정에서 재현됨

**이에 따라 Docker 기반 전체 배포는 성공했으나, 해당 인스턴스 환경에서는 운영이 어려움.**

---

## 3. 환경변수 설명

## 환경변수 설명 (.env.example)

| 변수명                   | 설명                    |
| ------------------------ | ----------------------- |
| DATABASE_URL             | PostgreSQL 연결 문자열  |
| JWT_SECRET               | Access Token 비밀키     |
| JWT_REFRESH_SECRET       | Refresh Token 비밀키    |
| PORT                     | 서버 포트 (기본 8080)   |
| ACCESS_TOKEN_EXPIRES_IN  | 액세스 토큰 만료 시간   |
| REFRESH_TOKEN_EXPIRES_IN | 리프레쉬 토큰 만료 시간 |

---

## 4. 배포 정보 (JCloud)

- Base URL: http://113.198.66.68:10081
- Swagger: http://113.198.66.68:10081/api-docs
- Health: http://113.198.66.68:10081/health
- Metrics: http://113.198.66.68:10081/metrics
  <br>
---

## 5. 인증 플로우

1. 로그인 → Access / Refresh Token 발급
2. Authorization Header 사용
   ```
   Authorization: Bearer <accessToken>
   ```
3. Access Token 만료 시 `/auth/refresh` 호출
4. 로그아웃 시 Refresh Token 폐기

---

## 6. 역할 / 권한

| 역할   | 권한                              |
| ------ | --------------------------------- |
| USER   | 리뷰, 댓글, 찜, 장바구니, 주문 등 |
| SELLER | USER 권한 + 도서 등록/수정        |
| ADMIN  | 도서, 사용자, 주문 관리           |

## 7. 예제 계정

### USER

```
user1@test.com / password123
```

### ADMIN

```
admin@test.com / password123
```

### SELLER

```
seller1@test.com / password123
```

---

## 8. 테스트

- Jest + Supertest
- 20개 이상의 자동화 테스트
- 성공 / 실패 / 권한 오류 케이스 포함
- 인증 필요 API 테스트 포함

---

## 9. 주요 엔드포인트 요약

| 영역 | 메서드 & 경로 | 설명 | 인증 |
| --- | --- | --- | --- |
| 인증 | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` | 로그인, access token 재발급, 로그아웃/refresh 토큰 폐기 | X (로그인 제외 요청은 refresh 토큰 필요) |
| 사용자 | `POST /users/signup`, `GET/PATCH/DELETE /users/me` | 가입, 내 정보 조회·수정·탈퇴 | 회원가입 X / 프로필 O |
| 개인목록 | `GET /users/me/reviews`, `GET /users/me/favorites` | 내가 작성한 리뷰 및 찜한 도서 목록 조회 | O |
| 도서 | `GET/POST /books`, `GET/PATCH/DELETE /books/{id}`, `GET /books/{id}/stats` | 공개 목록/상세 조회와 판매자·관리자용 등록/수정/삭제, 도서별 통계 | 조회 X / 등록·수정·삭제(판매자, 관리자) O |
| 리뷰 | `GET/POST /books/{id}/reviews`, `PATCH/DELETE /reviews/{id}` | 도서 리뷰 조회/작성 및 개별 리뷰 수정/삭제 | 조회 X / 작성·수정·삭제 O |
| 찜 | `POST /books/{id}/favorite`, `DELETE /books/{id}/favorite` | 도서 찜 추가/해제 | O |
| 장바구니 | `GET/DELETE /cart`, `POST /cart/items`, `PATCH/DELETE /cart/items/{itemId}` | 장바구니 조회/비우기 및 아이템 추가·수량 변경·삭제 | O |
| 주문 | `POST /orders`, `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel` | 주문 생성, 내 주문 목록/상세, 주문 취소 | O |
| 관리자 | `GET /admin/users`, `PATCH/DELETE /admin/users/{id}`, `GET /admin/orders`, `PATCH /admin/orders/{id}/status` | 관리자 전용 사용자·주문 관리 | O (ADMIN) |
| 모니터링 | `GET /health`, `GET /metrics`, `POST /metrics/reset` | 헬스 체크 및 메트릭 조회/초기화 | 헬스 X / 메트릭 O(내부) |

**추가 정보는 swagger문서 혹은 postman에서 확인하세요.**

---

## 10. Postman 컬렉션

- postman : https://documenter.getpostman.com/view/48959495/2sB3dTs88x#b7df93a4-69bf-43ea-aa66-c15f178516c9

- 환경 변수 (baseUrl, accessToken, refreshToken) 사용
- Pre-request / Post-response Script 5개이상 포함
- 로그인 시 토큰 자동 저장
- 권한 오류 테스트 포함

---

## 11. (추가점수) CI 구성

GitHub Actions를 사용하여 서버 코드에 대한 CI 파이프라인을 구성하였습니다.

- 테스트·Lint·빌드 자동화
- main / develop 브랜치 기준 자동 실행
- Node.js 20 환경에서 테스트 수행
- PostgreSQL 테스트 컨테이너 기반 통합 테스트
- Prisma Client 자동 생성 포함

---

## 12. (추가점수) 모니터링 지표(요청 수, 평균 지연, 에러율)

서버 요청 수, 평균 지연 시간, 에러율을 확인할 수 있는 관리자 전용 모니터링 대시보드입니다.

### 수집 지표

- totalRequests: 총 요청 수
- avgLatency: 평균 응답 지연(ms)
- errorRate: 에러율(%)
- requestsPerMinute: 분당 평균 요청 수
- uptime: 서버 가동 시간(초)

### 접근 방법

1. 서버 실행 후 브라우저 접속
   [http://113.198.66.68:10081/monitoring-dashboard.html](http://113.198.66.68:10081/monitoring-dashboard.html)

2. 관리자 계정으로 로그인하여 JWT 발급(swagger 혹은 postman이용)

3. 브라우저 콘솔(F12)에 토큰 저장

```js
localStorage.setItem("accessToken", "ADMIN_JWT_TOKEN");
```

4. 대시보드가 /metrics API를 자동 호출하여 지표 표시

**보안**

/metrics API는 ADMIN 권한 필요
Authorization 헤더 사용

```js
Authorization: Bearer <token>
```

---

## 13. 성능 / 보안 고려사항

- bcrypt 비밀번호 해시
- JWT 만료시간 분리
- 레이트 리밋
- CORS 설정
- 헬스체크: GET /health :인증 없이 200 반환 + 버전, 빌드시간 등 포함
- 메트릭 수집
- test코드 (/src/tests)

  
### 로깅 및 에러 처리
- morgan 미들웨어를 사용하여 모든 요청에 대해 메서드, 경로, 상태 코드, 지연 시간을 로그로 기록합니다.
- 서버 내부 에러 발생 시 스택 트레이스를 서버 로그에 남기되, 클라이언트 응답에는 민감한 정보가 노출되지 않도록 처리했습니다.

---

## 14. 한계 및 개선 계획

- 실제 결제 시스템 미연동
- 캐시 및 대규모 트래픽 대응 미구현
- 향후 Redis, WebSocket 기능 확장 예정

++github에 push오류로 모르는 사람이 contributor로 들어가 있으나, 현재 github캐시만 남아있고 실제로 contributor를 클릭해 확인하면 제대로 동작합니다...... 아마 곧 캐시가 사라지면 정상적으로 보일 것 같습니다++
