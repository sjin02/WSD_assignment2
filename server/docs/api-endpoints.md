# API Endpoint & Status Code Guide

## Endpoints
| Method | Path | Description | Success Response | Error Codes |
| --- | --- | --- | --- | --- |
| GET | /health | Service health check | 200 OK | 500 INTERNAL_SERVER_ERROR |
| POST | /auth/login | User login | 200 OK | 422 UNPROCESSABLE_ENTITY (입력값 검증 실패), 401 UNAUTHORIZED (이메일/비밀번호 불일치) |
| POST | /auth/refresh | Issue new access token | 200 OK | 422 UNPROCESSABLE_ENTITY (입력값 검증 실패), 401 UNAUTHORIZED (토큰 부재/유효하지 않음), 401 TOKEN_EXPIRED, 404 USER_NOT_FOUND |
| POST | /auth/logout | Revoke refresh tokens | 200 OK | 401 UNAUTHORIZED (인증 실패) |
| POST | /users/signup | Register new user | 201 CREATED | 422 UNPROCESSABLE_ENTITY (입력값 검증 실패), 409 DUPLICATE_RESOURCE (이메일 중복) |
| GET | /users/me | Get my profile | 200 OK | 401 UNAUTHORIZED |
| PATCH | /users/me | Update my profile | 200 OK | 422 UNPROCESSABLE_ENTITY (입력값 검증 실패), 401 UNAUTHORIZED |
| DELETE | /users/me | Soft delete my account | 200 OK | 401 UNAUTHORIZED |
| GET | /users/me/reviews | List my reviews | 200 OK | 401 UNAUTHORIZED |
| GET | /users/me/favorites | List my favorites | 200 OK | 401 UNAUTHORIZED |
| GET | /books | List books | 200 OK | 400 BAD_REQUEST (잘못된 쿼리 파라미터), 500 INTERNAL_SERVER_ERROR |
| GET | /books/:id | Book detail | 200 OK | 404 RESOURCE_NOT_FOUND |
| GET | /books/:id/stats | Book stats | 200 OK | 404 RESOURCE_NOT_FOUND |
| POST | /books | Create book (SELLER/ADMIN) | 201 CREATED | 401 UNAUTHORIZED, 403 FORBIDDEN |
| PATCH | /books/:id | Update book (SELLER/ADMIN) | 200 OK | 404 RESOURCE_NOT_FOUND, 401 UNAUTHORIZED, 403 FORBIDDEN |
| DELETE | /books/:id | Soft delete book (SELLER/ADMIN) | 200 OK | 404 RESOURCE_NOT_FOUND, 401 UNAUTHORIZED, 403 FORBIDDEN |
| POST | /books/:id/reviews | Create review | 201 CREATED | 422 UNPROCESSABLE_ENTITY (입력값 검증 실패), 401 UNAUTHORIZED |
| GET | /books/:id/reviews | List reviews | 200 OK | 404 RESOURCE_NOT_FOUND |
| POST | /books/:id/favorite | Add favorite | 201 CREATED | 409 DUPLICATE_RESOURCE (이미 찜함), 401 UNAUTHORIZED |
| DELETE | /books/:id/favorite | Remove favorite | 200 OK | 404 RESOURCE_NOT_FOUND, 401 UNAUTHORIZED |
| PATCH | /reviews/:id | Update review | 200 OK | 422 UNPROCESSABLE_ENTITY (입력값 검증 실패), 404 RESOURCE_NOT_FOUND, 403 FORBIDDEN, 401 UNAUTHORIZED |
| DELETE | /reviews/:id | Delete review | 200 OK | 404 RESOURCE_NOT_FOUND, 403 FORBIDDEN, 401 UNAUTHORIZED |
| GET | /admin/users | Admin: list users | 200 OK | 401 UNAUTHORIZED, 403 FORBIDDEN |
| DELETE | /admin/users/:id | Admin: soft delete user | 200 OK | 401 UNAUTHORIZED, 403 FORBIDDEN, 404 RESOURCE_NOT_FOUND, 409 STATE_CONFLICT (자기 자신 정지 시도) |
| PATCH | /admin/users/:id | Admin: update user | 200 OK | 422 UNPROCESSABLE_ENTITY (입력값 검증 실패), 401 UNAUTHORIZED, 403 FORBIDDEN, 404 USER_NOT_FOUND, 409 STATE_CONFLICT (자기 자신 수정 시도) |

## Standard Error Codes
| HTTP Status | Code | Description |
| --- | --- | --- |
| 400 | BAD_REQUEST | 요청 형식이 올바르지 않음 |
| 400 | VALIDATION_FAILED | 필드 유효성 검사 실패 |
| 400 | INVALID_QUERY_PARAM | 쿼리 파라미터 값이 잘못됨 |
| 401 | UNAUTHORIZED | 인증 토큰 없음 또는 잘못된 토큰 |
| 401 | TOKEN_EXPIRED | 토큰 만료 |
| 403 | FORBIDDEN | 접근 권한 없음 (Role 불일치 등) |
| 404 | RESOURCE_NOT_FOUND | 요청한 리소스가 존재하지 않음 |
| 404 | USER_NOT_FOUND | 사용자 ID가 존재하지 않음 |
| 409 | DUPLICATE_RESOURCE | 중복 데이터 존재(이메일 중복 등) |
| 409 | STATE_CONFLICT | 리소스 상태 충돌(이미 삭제된 항목 등) |
| 422 | UNPROCESSABLE_ENTITY | 처리할 수 없는 요청 내용(형식은 맞지만 논리적 오류) |
| 429 | TOO_MANY_REQUESTS | 요청 한도 초과 (rate limiting) |
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류 |
| 500 | DATABASE_ERROR | DB 연동 오류 |
| 500 | UNKNOWN_ERROR | 알 수 없는 오류 (최종 fallback) |
