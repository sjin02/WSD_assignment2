import request from 'supertest';
import app from '../app.js';
import prisma from '../prisma/client.js';
import { createUsers } from '../prisma/data/users.js';

describe('인증 API', () => {
  beforeAll(async () => {
    // 테스트 데이터베이스 초기화
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.favorite.deleteMany();
    await prisma.review.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();

    // 테스트 사용자 생성
    await createUsers(prisma);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /auth/login', () => {
    it('유효한 자격 증명으로 로그인 성공', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user1@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty('accessToken');
      expect(response.body.data).toHaveProperty('refreshToken');
    });

    it('존재하지 않는 이메일로 로그인 실패', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });

    it('잘못된 비밀번호로 로그인 실패', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user1@test.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });

    it('이메일 누락 시 로그인 실패', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          password: 'password123',
        });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('code');
    });

    it('비밀번호 누락 시 로그인 실패', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'user1@test.com',
        });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken;
    
    beforeAll(async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'user1@test.com',
          password: 'password123',
        });

      refreshToken = loginResponse.body.data.refreshToken;
    });

    it('리프레시 토큰으로 액세스 토큰 갱신 성공', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken });
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('리프레시 토큰 없이 갱신 실패', async () => {
      const response = await request(app)
        .post('/auth/refresh');

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('code');
    });
  });


  describe('POST /auth/logout', () => {
    let accessToken;

    beforeEach(async () => {
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'user1@test.com',
          password: 'password123',
        });

      accessToken = loginResponse.body.data.accessToken;
    });

    it('로그아웃 성공', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
    });

    it('인증 없이 로그아웃 실패', async () => {
      const response = await request(app)
        .post('/auth/logout');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });

    it('유효하지 않은 토큰으로 로그아웃 실패', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });
  });
});
