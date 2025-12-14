import request from 'supertest';
import app from '../app.js';
import prisma from '../prisma/client.js';
import { createUsers } from '../prisma/data/users.js';
import { createBooks } from '../prisma/data/books.js';

describe('주문 API', () => {
  let userToken;
  let bookId;
  let orderId;

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

  describe('POST /orders', () => {
    beforeEach(async () => {
      await request(app)
        .delete('/cart')
        .set('Authorization', `Bearer ${userToken}`);
    });

    it('새 주문 생성 성공', async () => {
      const cartResponse = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bookId: bookId,
          quantity: 2,
        });

      expect(cartResponse.status).toBe(201);
      expect(cartResponse.body.data).toHaveProperty('cartItem');

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty('order');
      expect(response.body.data.order).toHaveProperty('items');
      expect(Array.isArray(response.body.data.order.items)).toBe(true);

      orderId = response.body.data.order.id;
    });

    it('비어있는 장바구니로 주문 생성 실패', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`);
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('code');
    });

    it('인증 없이 주문 생성 실패', async () => {
      const response = await request(app)
        .post('/orders');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('GET /orders', () => {
    beforeAll(async () => {
      const cartResponse = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bookId: bookId,
          quantity: 1,
        });

      expect(cartResponse.status).toBe(201);

      const orderResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(orderResponse.status).toBe(201);
      orderId = orderResponse.body.data.order.id;
    });

    it('사용자 주문 목록 조회 성공', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(Array.isArray(response.body.data.orders)).toBe(true);
      expect(response.body.data.orders.length).toBeGreaterThan(0);
    });

    it('페이지네이션 지원 확인', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
    });

    it('인증 없이 주문 목록 조회 실패', async () => {
      const response = await request(app)
        .get('/orders');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('GET /orders/:id', () => {
    beforeAll(async () => {
      const cartResponse = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bookId: bookId,
          quantity: 1,
        });

      expect(cartResponse.status).toBe(201);

      const orderResponse = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(orderResponse.status).toBe(201);
      orderId = orderResponse.body.data.order.id;
    });

    it('특정 주문 조회 성공', async () => {
      const response = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.order).toHaveProperty('id');
      expect(response.body.data.order.id).toBe(orderId);
    });

    it('존재하지 않는 주문 조회 실패', async () => {
      const response = await request(app)
        .get('/orders/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('code');
    });

    it('인증 없이 주문 조회 실패', async () => {
      const response = await request(app)
        .get(`/orders/${orderId}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('POST /orders/:id/cancel', () => {
    let cancelOrderId;

    beforeAll(async () => {
      // 취소할 주문 생성
      await request(app)
        .delete('/cart')
        .set('Authorization', `Bearer ${userToken}`);

      const cartResponse = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bookId: bookId,
          quantity: 1,
        });

      expect(cartResponse.status).toBe(201);

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`);

      cancelOrderId = response.body.data.order.id;
    });

    it('주문 취소 성공', async () => {
      const response = await request(app)
        .post(`/orders/${cancelOrderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.order.status).toBe('CANCELLED');
    });

    it('존재하지 않는 주문 취소 실패', async () => {
      const response = await request(app)
        .post('/orders/99999/cancel')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('code');
    });

    it('인증 없이 주문 취소 실패', async () => {
      const response = await request(app)
        .post(`/orders/${orderId}/cancel`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });
  });
});
