import request from 'supertest';
import app from '../app.js';
import prisma from '../prisma/client.js';
import { createUsers } from '../prisma/data/users.js';
import { createBooks } from '../prisma/data/books.js';

describe('리뷰 API', () => {
  let userToken;
  let user2Token;
  let bookId;
  let reviewId;

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

    // 사용자 1 로그인
    const user1Login = await request(app)
      .post('/auth/login')
      .send({
        email: 'user1@test.com',
        password: 'password123',
      });
    userToken = user1Login.body.data.accessToken;

    // 사용자 2 로그인
    const user2Login = await request(app)
      .post('/auth/login')
      .send({
        email: 'user2@test.com',
        password: 'password123',
      });
    user2Token = user2Login.body.data.accessToken;

    // 테스트용 책 ID 가져오기
    const book = await prisma.book.findFirst();
    bookId = book.id;

    // 리뷰 생성
    const reviewResponse = await request(app)
      .post(`/books/${bookId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        rating: 4,
        comment: '좋은 책입니다',
      });

    reviewId = reviewResponse.body.data.review.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('PATCH /reviews/:id', () => {
    it('본인 리뷰 수정 성공', async () => {
      const response = await request(app)
        .patch(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 5,
          comment: '수정된 리뷰 - 훌륭한 책입니다',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.review.rating).toBe(5);
      expect(response.body.data.review.comment).toBe('수정된 리뷰 - 훌륭한 책입니다');
    });

    it('평점만 수정 성공', async () => {
      const response = await request(app)
        .patch(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 3,
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.review.rating).toBe(3);
    });

    it('댓글만 수정 성공', async () => {
      const response = await request(app)
        .patch(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          comment: '다시 수정된 리뷰',
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.data.review.comment).toBe('다시 수정된 리뷰');
    });

    it('다른 사용자 리뷰 수정 실패', async () => {
      const response = await request(app)
        .patch(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          rating: 1,
          comment: '다른 사람 리뷰 수정 시도',
        });

      expect(response.status).toBe(403);
      expect(response.body.status).toBe("fail");
    });

    it('존재하지 않는 리뷰 수정 실패', async () => {
      const response = await request(app)
        .patch('/reviews/99999')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 5,
        });

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("fail");
    });

    it('유효하지 않은 평점으로 수정 실패', async () => {
      const response = await request(app)
        .patch(`/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 6,
        });

      expect(response.status).toBe(422);
      expect(response.body.status).toBe("fail");
    });

    it('인증 없이 리뷰 수정 실패', async () => {
      const response = await request(app)
        .patch(`/reviews/${reviewId}`)
        .send({
          rating: 5,
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("fail");
    });
  });

  describe('DELETE /reviews/:id', () => {
    let deleteReviewId;

    beforeAll(async () => {
      // 삭제할 리뷰 생성
      const reviewResponse = await request(app)
        .post(`/books/${bookId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          rating: 3,
          comment: '삭제될 리뷰',
        });

      deleteReviewId = reviewResponse.body.data.review.id;
    });

    it('본인 리뷰 삭제 성공', async () => {
      const response = await request(app)
        .delete(`/reviews/${deleteReviewId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe("success");
    });

    it('다른 사용자 리뷰 삭제 실패', async () => {
      // 새 리뷰 생성
      const reviewResponse = await request(app)
        .post(`/books/${bookId}/reviews`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({
          rating: 4,
          comment: '다른 사용자의 리뷰',
        });

      const otherReviewId = reviewResponse.body.data.review.id;

      const response = await request(app)
        .delete(`/reviews/${otherReviewId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.status).toBe("fail");
    });

    it('존재하지 않는 리뷰 삭제 실패', async () => {
      const response = await request(app)
        .delete('/reviews/99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe("fail");
    });

    it('인증 없이 리뷰 삭제 실패', async () => {
      const response = await request(app)
        .delete(`/reviews/${reviewId}`);

      expect(response.status).toBe(401);
      expect(response.body.status).toBe("fail");
    });
  });
});
