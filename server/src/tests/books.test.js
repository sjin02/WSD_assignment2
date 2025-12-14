import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/prisma/client.js';
import { createUsers } from '../src/prisma/data/users.js';
import { createBooks } from '../src/prisma/data/books.js';

describe('도서 API', () => {
  let userToken;
  let sellerToken;
  let bookId;

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
    const userLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'password123',
      });
    userToken = userLogin.body.data.accessToken;

    // 판매자 로그인
    const sellerLogin = await request(app)
      .post('/auth/login')
      .send({
        email: 'seller1@test.com',
        password: 'password123',
      });
    sellerToken = sellerLogin.body.data.accessToken;

    // 테스트용 책 ID 가져오기
    const book = await prisma.book.findFirst();
    bookId = book.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('GET /books', () => {
    it('모든 도서 목록 조회 성공', async () => {
      const response = await request(app)
        .get('/books');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.books.length).toBeGreaterThan(0);
    });

    it('페이지네이션 지원 확인', async () => {
      const response = await request(app)
        .get('/books')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('검색 기능 지원 확인', async () => {
      const response = await request(app)
        .get('/books')
        .query({ search: '책' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /books/:id', () => {
    it('특정 도서 조회 성공', async () => {
      const response = await request(app)
        .get(`/books/${bookId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.book).toHaveProperty('id');
      expect(response.body.data.book).toHaveProperty('title');
    });

    it('존재하지 않는 도서 조회 실패', async () => {
      const response = await request(app)
        .get('/books/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /books/:id/stats', () => {
    it('도서 통계 조회 성공', async () => {
      const response = await request(app)
        .get(`/books/${bookId}/stats`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('stats');
    });
  });

  describe('POST /books', () => {
    it('판매자 권한으로 새 도서 생성 성공', async () => {
      const response = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: '새로운 책',
          author: '작가 이름',
          price: 15000,
          stock: 100,
          isbn: 'ISBN-NEW-001',
          description: '새로운 책 설명',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.book.title).toBe('새로운 책');
    });

    it('일반 사용자 권한으로 도서 생성 실패', async () => {
      const response = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '새로운 책',
          author: '작가 이름',
          price: 15000,
          stock: 100,
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('인증 없이 도서 생성 실패', async () => {
      const response = await request(app)
        .post('/books')
        .send({
          title: '새로운 책',
          author: '작가 이름',
          price: 15000,
          stock: 100,
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /books/:id', () => {
    it('판매자 권한으로 도서 수정 성공', async () => {
      const response = await request(app)
        .patch(`/books/${bookId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: '수정된 책 제목',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.book.title).toBe('수정된 책 제목');
    });

    it('일반 사용자 권한으로 도서 수정 실패', async () => {
      const response = await request(app)
        .patch(`/books/${bookId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: '수정된 책 제목',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /books/:id', () => {
    it('일반 사용자 권한으로 도서 삭제 실패', async () => {
      const response = await request(app)
        .delete(`/books/${bookId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('판매자 권한으로 도서 삭제 성공', async () => {
      // 새 책 생성
      const createResponse = await request(app)
        .post('/books')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          title: '삭제될 책',
          author: '작가',
          price: 10000,
          stock: 10,
          isbn: 'ISBN-DELETE-001',
        });

      const deleteBookId = createResponse.body.data.book.id;

      const response = await request(app)
        .delete(`/books/${deleteBookId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /books/:id/reviews', () => {
    it('도서 리뷰 작성 성공', async () => {
      const response = await request(app)
        .post(`/books/${bookId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 5,
          comment: '훌륭한 책입니다',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.review.rating).toBe(5);
    });

    it('인증 없이 리뷰 작성 실패', async () => {
      const response = await request(app)
        .post(`/books/${bookId}/reviews`)
        .send({
          rating: 5,
          comment: '훌륭한 책입니다',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /books/:id/reviews', () => {
    it('도서 리뷰 목록 조회 성공', async () => {
      const response = await request(app)
        .get(`/books/${bookId}/reviews`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.reviews)).toBe(true);
    });
  });

  describe('POST /books/:id/favorite', () => {
    it('도서 찜하기 성공', async () => {
      const response = await request(app)
        .post(`/books/${bookId}/favorite`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('인증 없이 찜하기 실패', async () => {
      const response = await request(app)
        .post(`/books/${bookId}/favorite`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /books/:id/favorite', () => {
    beforeAll(async () => {
      // 찜 추가
      await request(app)
        .post(`/books/${bookId}/favorite`)
        .set('Authorization', `Bearer ${userToken}`);
    });

    it('도서 찜 취소 성공', async () => {
      const response = await request(app)
        .delete(`/books/${bookId}/favorite`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('인증 없이 찜 취소 실패', async () => {
      const response = await request(app)
        .delete(`/books/${bookId}/favorite`);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
