import {
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
} from "../services/review.service.js";
import { createReviewDto, updateReviewDto } from "../dtos/review.dto.js";

export async function createReviewController(req, res, next) {
  try {
    const bookId = Number(req.params.id);
    const userId = req.user.userId;
    const dto = createReviewDto.parse(req.body);
    
    const review = await createReview({
      userId,
      bookId,
      ...dto, // rating, comment
    });

    res.success(review, 201, "리뷰 작성 완료");
  } catch (err) {
    next(err);
  }
}

export async function updateReviewController(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const userId = req.user.userId;
    const dto = updateReviewDto.parse(req.body);

    const review = await updateReview({
      reviewId,
      userId,
      ...dto,
    });
    
    res.success(review, 200, "리뷰 수정 완료");
  } catch (err) {
    if (err.message === "REVIEW_NOT_FOUND") {
      return res.fail("리뷰를 찾을 수 없습니다", 404, "RESOURCE_NOT_FOUND");
    }

    if (err.message === "FORBIDDEN")
      return res.fail("권한 없음", 403, "FORBIDDEN");
    next(err);
  }
}

export async function deleteReviewController(req, res, next) {
  try {
    const reviewId = Number(req.params.id);
    const userId = req.user.userId;

    await deleteReview({ reviewId, userId });
    res.success({}, 200, "리뷰 삭제 완료");
  } catch (err) {
    if (err.message === "REVIEW_NOT_FOUND") {
      return res.fail("리뷰를 찾을 수 없습니다", 404, "RESOURCE_NOT_FOUND");
    }

    if (err.message === "FORBIDDEN")
      return res.fail("권한 없음", 403, "FORBIDDEN");
    next(err);
  }
}

export async function getMyReviewsController(req, res, next) {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;

    const result = await getMyReviews({
      userId,
      page: Number(page),
      limit: Number(limit),
    });

    res.success(result, 200, "내 리뷰 조회 완료");
  } catch (err) {
    next(err);
  }
}
