# API Design Summary

## 현재 API 개요

- Express 5 기반 REST API로 인증은 JWT Bearer 토큰으로 보호되며, `/auth` 하위에서 로그인/토큰 재발급/로그아웃을 제공한다.
- 회원 가입은 `/users/signup`에서 처리하고, 이후 `/users/me`에서 내 프로필 조회·수정·탈퇴, `/users/me/reviews`와 `/users/me/favorites`에서 개인화 데이터를 조회한다.
- 도서 도메인은 `/books` 하위에 통합되어 목록/등록/수정/삭제/통계 조회 및 리뷰 작성·수정·삭제, 도서 찜(즐겨찾기) 관리까지 포함한다.
- 구매 여정은 `/cart`와 `/orders` 리소스로 분리되어 장바구니 CRUD, 주문 생성·조회·취소를 지원하며, `/admin` 네임스페이스에서 관리자용 사용자·주문 관리가 제공된다.
- 운영/모니터링을 위해 `/health`, `/metrics`, `/metrics/reset` 엔드포인트가 추가되었고 Swagger UI는 `/api-docs`에 노출된다.

## 주요 엔드포인트 요약

| 영역     | 메서드 & 경로                                                                                                | 설명                                                              |
| -------- | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| 인증     | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`                                                | 로그인, access token 재발급, 로그아웃/refresh 토큰 폐기           |
| 사용자   | `POST /users/signup`, `GET/PATCH/DELETE /users/me`                                                           | 가입, 내 정보 조회·수정·탈퇴                                      |
| 개인화   | `GET /users/me/reviews`, `GET /users/me/favorites`                                                           | 내가 작성한 리뷰 및 찜한 도서 목록 조회                           |
| 도서     | `GET/POST /books`, `GET/PATCH/DELETE /books/{id}`, `GET /books/{id}/stats`                                   | 공개 목록/상세 조회와 판매자·관리자용 등록/수정/삭제, 도서별 통계 |
| 리뷰     | `GET/POST /books/{id}/reviews`, `PATCH/DELETE /reviews/{id}`                                                 | 도서 리뷰 조회/작성 및 개별 리뷰 수정/삭제                        |
| 찜       | `POST /books/{id}/favorite`, `DELETE /books/{id}/favorite`                                                   | 도서 찜 추가/해제                                                 |
| 장바구니 | `GET/DELETE /cart`, `POST /cart/items`, `PATCH/DELETE /cart/items/{itemId}`                                  | 장바구니 조회/비우기 및 아이템 추가·수량 변경·삭제                |
| 주문     | `POST /orders`, `GET /orders`, `GET /orders/{id}`, `POST /orders/{id}/cancel`                                | 주문 생성, 내 주문 목록/상세, 주문 취소                           |
| 관리자   | `GET /admin/users`, `PATCH/DELETE /admin/users/{id}`, `GET /admin/orders`, `PATCH /admin/orders/{id}/status` | 관리자 전용 사용자·주문 관리                                      |
| 모니터링 | `GET /health`, `GET /metrics`, `POST /metrics/reset`                                                         | 헬스 체크 및 메트릭 조회/초기화                                   |

## 과제1 API 대비 변경 요약

- **경로 네임스페이스 축소**: 모든 엔드포인트의 `/api` 접두사가 제거되었고, 인증/사용자/도서 도메인이 단일 루트(`/auth`, `/users`, `/books`)로 재배치되었다. 과거 `/api/public`/`/api/admin` 구분은 역할 기반 권한(SELLER/ADMIN)으로 처리된다.
  <br>
- **회원 흐름 재구성**: 회원가입이 `/api/auth/signup`에서 `/users/signup`으로 이동했고, 프로필 삭제가 단일 `DELETE /users/me`로 단순화되었다(소프트/영구 삭제 이원화 제거). 프로필 관련 좋아요/리뷰 조회 경로도 `/users/me/reviews`, `/users/me/favorites`로 정리되었다.
  <br>
- **도서/판매자 영역 통합**: 별도의 판매자 등록·조회·수정·삭제 API(`/api/sellers/...`)가 사라지고, 도서 등록·수정·삭제를 `/books` 리소스에서 SELLER/ADMIN 역할 제어로 처리한다. 도서 통계 조회 `/books/{id}/stats`가 새로 추가되었다.
  <br>
- **리뷰·피드백 모델 수정**: 리뷰 작성·조회 경로가 `/api/books/{bookId}/reviews`에서 `/books/{id}/reviews`로, 업데이트/삭제는 `/reviews/{id}`로 정규화되었다. 리뷰/댓글 좋아요 및 댓글 CRUD API가 제거되었으며, 도서 찜(`/books/{id}/favorite`)이 유일한 피드백 액션으로 남았다.
  <br>
- **찜/라이브러리 구조 변경**: 기존 찜(`/api/wishlist`)과 라이브러리(`/api/library`) 리소스가 통합·대체되어, 현재는 사용자의 즐겨찾기 목록 `/users/me/favorites`와 도서별 찜 추가/해제 엔드포인트만 제공한다.
  <br>
- **장바구니·주문 기능 추가**: 과제1에는 없던 장바구니(` /cart`, `/cart/items`)와 주문(` /orders`) 흐름이 신설되었고, 관리자 전용 주문/사용자 관리, 서비스 상태·메트릭 모니터링 엔드포인트가 추가되었다.
