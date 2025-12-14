import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma/client.js';
import { createUsers } from '../src/prisma/data/users.js';
import { createBooks } from '../src/prisma/data/books.js';

describe('장바구니 API', () => {
  let userToken;
  let bookId;
  let cartItemId;

  beforeAll(async () => {
    // 테스트 데이터베이스 초기화
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.review.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();

    // 테스트 데이터 생성
    await createUsers(prisma);
    await createBooks(prisma);

    // 사용자 로그인
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'password123',
      });

    userToken = loginResponse.body.data.accessToken;

    // 테스트용 책 ID 가져오기
    const book = await prisma.book.findFirst();
    bookId = book.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /cart', () => {
    it('사용자 장바구니 조회 성공', async () => {
      const response = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('cart');
    });

    it('인증 없이 장바구니 조회 실패', async () => {
      const response = await request(app)
        .get('/cart');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /cart/items', () => {
    it('장바구니에 상품 추가 성공', async () => {
      const response = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bookId: bookId,
          quantity: 2,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cartItem.quantity).toBe(2);

      // cartItemId 저장
      cartItemId = response.body.data.cartItem.id;
    });

    it('유효하지 않은 도서 ID로 추가 실패', async () => {
      const response = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bookId: 99999,
          quantity: 1,
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('유효하지 않은 수량으로 추가 실패', async () => {
      const response = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bookId: bookId,
          quantity: 0,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('인증 없이 상품 추가 실패', async () => {
      const response = await request(app)
        .post('/cart/items')
        .send({
          bookId: bookId,
          quantity: 1,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /cart/items/:itemId', () => {
    it('장바구니 상품 수량 변경 성공', async () => {
      const response = await request(app)
        .patch(`/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.cartItem.quantity).toBe(5);
    });

    it('유효하지 않은 수량으로 변경 실패', async () => {
      const response = await request(app)
        .patch(`/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: -1,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('존재하지 않는 상품 수량 변경 실패', async () => {
      const response = await request(app)
        .patch('/cart/items/99999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          quantity: 3,
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('인증 없이 수량 변경 실패', async () => {
      const response = await request(app)
        .patch(`/cart/items/${cartItemId}`)
        .send({
          quantity: 3,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /cart/items/:itemId', () => {
    it('장바구니 상품 삭제 성공', async () => {
      const response = await request(app)
        .delete(`/cart/items/${cartItemId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('존재하지 않는 상품 삭제 실패', async () => {
      const response = await request(app)
        .delete('/cart/items/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('인증 없이 상품 삭제 실패', async () => {
      const response = await request(app)
        .delete('/cart/items/1');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /cart', () => {
    beforeAll(async () => {
      // 장바구니에 아이템 추가
      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bookId: bookId,
          quantity: 1,
        });
    });

    it('장바구니 전체 비우기 성공', async () => {
      const response = await request(app)
        .delete('/cart')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('인증 없이 장바구니 비우기 실패', async () => {
      const response = await request(app)
        .delete('/cart');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
