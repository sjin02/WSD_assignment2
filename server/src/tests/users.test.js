import request from 'supertest';
import app from '../app.js';
import prisma from '../prisma/client.js';
import { createUsers } from '../prisma/data/users.js';

describe('사용자 API', () => {
  let accessToken;

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

    // 테스트용 로그인
    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'password123',
      });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /users/signup', () => {
    it('새 사용자 회원가입 성공', async () => {
      const response = await request(app)
        .post('/users/signup')
        .send({
          email: 'newuser@test.com',
          password: 'password123',
          name: '새로운 사용자',
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data.email).toBe('newuser@test.com')
    });

    it('중복된 이메일로 회원가입 실패', async () => {
      const response = await request(app)
        .post('/users/signup')
        .send({
          email: 'user1@test.com',
          password: 'password123',
          name: '중복 사용자',
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('code');
    });

    it('필수 필드 누락 시 회원가입 실패', async () => {
      const response = await request(app)
        .post('/users/signup')
        .send({
          email: 'incomplete@test.com',
        });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('code');
    });

    it('유효하지 않은 이메일 형식으로 회원가입 실패', async () => {
      const response = await request(app)
        .post('/users/signup')
        .send({
          email: 'invalidemail',
          password: 'password123',
          name: '테스트 사용자',
        });

      expect(response.status).toBe(422);
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('GET /users/me', () => {
    it('현재 사용자 정보 조회 성공', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data.email).toBe('user1@test.com');
    });

    it('인증 없이 사용자 정보 조회 실패', async () => {
      const response = await request(app)
        .get('/users/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });

    it('유효하지 않은 토큰으로 사용자 정보 조회 실패', async () => {
      const response = await request(app)
        .get('/users/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('PATCH /users/me', () => {
    it('사용자 정보 수정 성공', async () => {
      const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          name: '변경된 이름',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.name).toBe('변경된 이름');
    });


    it('인증 없이 사용자 정보 수정 실패', async () => {
      const response = await request(app)
        .patch('/users/me')
        .send({
          name: '변경된 이름',
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('DELETE /users/me', () => {
    it('사용자 계정 소프트 삭제 성공', async () => {
      // 새 사용자 생성
    const signupResponse = await request(app)
      .post('/users/signup')
      .send({
        email: 'todelete@test.com',
        password: 'password123',
        name: '삭제될 사용자',
      });

    const loginResponse = await request(app)
      .post('/auth/login')
      .send({
        email: 'todelete@test.com',
        password: 'password123',
      });

    const deleteToken = loginResponse.body.data.accessToken;

    const response = await request(app)
      .delete('/users/me')
      .set('Authorization', `Bearer ${deleteToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
    });

    it('인증 없이 계정 삭제 실패', async () => {
      const response = await request(app)
        .delete('/users/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });
  });

  describe('GET /users/me/reviews', () => {
    it('사용자 리뷰 목록 조회 성공', async () => {
      const response = await request(app)
        .get('/users/me/reviews?page=1&limit=10')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");

      expect(response.body.data).toHaveProperty('items');
      expect(Array.isArray(response.body.data.items)).toBe(true);

      expect(response.body.data).toHaveProperty('meta');
      expect(response.body.data.meta).toHaveProperty('page');
      expect(response.body.data.meta).toHaveProperty('limit');
    });

    it('인증 없이 리뷰 목록 조회 실패', async () => {
      const response = await request(app)
        .get('/users/me/reviews');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });
  });


  describe('GET /users/me/favorites', () => {
    it('사용자 찜 목록 조회 성공', async () => {
      const response = await request(app)
        .get('/users/me/favorites')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data).toHaveProperty('favorites');
      expect(Array.isArray(response.body.data.favorites)).toBe(true);
    });

    it('인증 없이 찜 목록 조회 실패', async () => {
      const response = await request(app)
        .get('/users/me/favorites');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('code');
    });
  });
});
