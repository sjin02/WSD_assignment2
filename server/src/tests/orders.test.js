import request from 'supertest';
import app from '../app.js';
import prisma from '../prisma/client.js';
import { createUsers } from '../prisma/data/users.js';
import { createBooks } from '../prisma/data/books.js';

describe('주문 API', () => {
  let userToken;
  let bookId;

  beforeAll(async () => {
    // DB 초기화
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.review.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.book.deleteMany();
    await prisma.user.deleteMany();

    await createUsers(prisma);
    await createBooks(prisma);

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'password123',
      });

    userToken = loginResponse.body.data.accessToken;

    const book = await prisma.book.findFirst();
    bookId = book.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  /**
   * 공통 헬퍼: 새 주문 생성
   */
  const createOrder = async (quantity = 1) => {
    await request(app)
      .delete('/cart')
      .set('Authorization', `Bearer ${userToken}`);

    await request(app)
      .post('/cart/items')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ bookId, quantity });

    const res = await request(app)
      .post('/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(201);
    return res.body.data.order.id;
  };

  describe('POST /orders', () => {
    beforeEach(async () => {
      await request(app)
        .delete('/cart')
        .set('Authorization', `Bearer ${userToken}`);
    });

    it('새 주문 생성 성공', async () => {
      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ bookId, quantity: 2 });

      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(201);
      expect(response.body.data.order).toHaveProperty('items');
    });

    it('비어있는 장바구니로 주문 생성 실패', async () => {
      const response = await request(app)
        .post('/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(409);
    });

    it('인증 없이 주문 생성 실패', async () => {
      const response = await request(app).post('/orders');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /orders', () => {
    beforeAll(async () => {
      await createOrder();
    });

    it('사용자 주문 목록 조회 성공', async () => {
      const response = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.orders.length).toBeGreaterThan(0);
    });

    it('페이지네이션 지원 확인', async () => {
      const response = await request(app)
        .get('/orders?page=1&limit=10')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
    });

    it('인증 없이 주문 목록 조회 실패', async () => {
      const response = await request(app).get('/orders');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /orders/:id', () => {
    let orderId;

    beforeAll(async () => {
      orderId = await createOrder();
    });

    it('특정 주문 조회 성공', async () => {
      const response = await request(app)
        .get(`/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.order.id).toBe(orderId);
    });

    it('존재하지 않는 주문 조회 실패', async () => {
      const response = await request(app)
        .get('/orders/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });

    it('인증 없이 주문 조회 실패', async () => {
      const response = await request(app).get(`/orders/${orderId}`);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /orders/:id/cancel', () => {
    let cancelOrderId;

    beforeAll(async () => {
      cancelOrderId = await createOrder();
    });

    it('주문 취소 성공', async () => {
      const response = await request(app)
        .post(`/orders/${cancelOrderId}/cancel`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.order.status).toBe('CANCELLED');
    });

    it('존재하지 않는 주문 취소 실패', async () => {
      const response = await request(app)
        .post('/orders/99999/cancel')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
    });

    it('인증 없이 주문 취소 실패', async () => {
      const response = await request(app)
        .post(`/orders/${cancelOrderId}/cancel`);

      expect(response.status).toBe(401);
    });
  });
});
