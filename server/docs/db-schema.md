# DB Schema

## 데이터베이스 및 공통 설정

- PostgreSQL을 사용하며 Prisma Client가 `DATABASE_URL` 환경 변수로 연결된다.

- 공통 enum: `UserRole`(USER/SELLER/ADMIN), `OrderStatus`(PENDING, PAID, SHIPPED, DONE, CANCELLED).

- N+1 방지: Prisma는 지연 로딩이 기본이며, 목록 조회 시 관계 데이터를 함께 가져와야 하는 경우 `include`/`select`로 명시적으로 eager 로딩하여 관계형 데이터를 한 번의 쿼리로 묶는다(예: 리뷰 목록에서 작성자/도서 동시 로딩).

## 주요 테이블

- **User**: 이메일/비밀번호 해시/이름/역할/생성일·삭제일을 보유하며 Cart, Order, Review, Favorite, RefreshToken과 연관된다.

- **Book**: 제목·가격·재고·ISBN·설명·표지 URL·생성일·삭제일을 저장하며 장바구니 아이템, 주문 아이템, 리뷰, 찜과 연관된다.

- **Cart & CartItem**: 사용자당 1개의 Cart(`userId` 유니크)가 존재하고, CartItem은 도서/수량을 보유하며 Cart·Book과 연결된다.

- **Order & OrderItem**: 주문은 사용자, 총액, 상태(`OrderStatus`), 생성 시각을 가지며 OrderItem이 도서·단가·수량을 기록한다.

- **Review**: 사용자와 도서에 대한 평점(`rating`)과 코멘트를 저장한다.

- **Favorite**: 사용자-도서 간 찜 관계를 나타내며 `(userId, bookId)` 조합이 Unique이다.

- **RefreshToken**: 사용자별 토큰 해시/만료/폐기 시각을 저장하며 `userId` 인덱스를 가진다.

**더 정확한 DB스키마는 /server/src/prisma/schema.prisma에 있다.**
