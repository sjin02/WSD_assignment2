# Bookstore API

온라인 서점 서비스를 위한 REST API 서버입니다.  
사용자 인증을 기반으로 도서 조회, 구매, 리뷰, 찜, 장바구니, 주문 관리 기능을 제공합니다.

---

## 1. 프로젝트 개요

### 문제 정의

온라인 서점 서비스에서 필요한 핵심 기능(회원 관리, 도서 관리, 주문, 리뷰 등)을  
REST API 형태로 구현하고, 인증/인가, 테스트, 문서화까지 포함한 백엔드 서버를 구축합니다.
본 프로젝트는 Node.js 서버를 JCloud VM에 배포하였으며, 서버 재시작 시에도 자동으로 실행되도록 설정하였습니다. 데이터베이스는 PostgreSQL을 사용한다.

### 주요 기능

- JWT 기반 사용자 인증 (Access / Refresh Token)
- 역할 기반 권한 제어 (USER / ADMIN)
- 도서 CRUD 및 검색, 페이지네이션
- 장바구니, 주문 흐름
- 리뷰 및 찜 기능
- Swagger API 문서 자동화
- Jest + Supertest 자동화 테스트
- Postman 컬렉션 및 테스트 스크립트 제공

---

## 2. 실행 방법

### 로컬 실행

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

## 3. 환경변수 설명

```env
PORT=8080
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
JWT_ACCESS_SECRET=access-secret
JWT_REFRESH_SECRET=refresh-secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

---

## 4. 배포 정보 (JCloud)

- **Base URL**  
  http://113.198.66.75:18225

- **Swagger URL**  
  http://113.198.66.75:18225/api-docs

- **Health Check**  
  `GET /health` → `200 OK`

---

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

### USER

- 도서 조회
- 리뷰 작성
- 장바구니
- 주문

### ADMIN

- 도서 관리
- 사용자 관리
- 주문 관리

---

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

## 9. Postman 컬렉션

- 환경 변수 (baseUrl, accessToken, refreshToken) 사용
- Pre-request / Post-response Script 5개이상 포함
- 로그인 시 토큰 자동 저장
- 권한 오류 테스트 포함

---

## 10. (추가점수) CI 구성

GitHub Actions를 사용하여 서버 코드에 대한 CI 파이프라인을 구성하였다.

- main / develop 브랜치 기준 자동 실행
- Node.js 20 환경에서 테스트 수행
- PostgreSQL 테스트 컨테이너 기반 통합 테스트
- Prisma Client 자동 생성 포함

---

## 11. 한계 및 개선 계획

- 실제 결제 시스템 미연동
- 캐시 및 대규모 트래픽 대응 미구현
- 향후 Redis, WebSocket 기능 확장 예정

++github에 push오류로 모르는 사람이 contributor로 들어가 있으나, 현재 github캐시만 남아있고 실제로 contributor를 클릭해 확인하면 제대로 동작합니다...... 아마 곧 캐시가 사라지면 정상적으로 보일 것 같습니다++
