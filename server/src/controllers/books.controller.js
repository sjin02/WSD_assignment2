import {
  getBooks,
  getBookById,
  getBookReviews,
  getBookStats,
  createBook,
  updateBook,
  deleteBook,
} from "../services/book.service.js";


/**
 * GET /books
 */
export async function getBooksController(req, res, next) {
  try {
    const {
      page = 1,
      limit = 20,
      sort = "createdAt",
      order = "desc",
      q,
      minPrice,
      maxPrice,
    } = req.query;

    const result = await getBooks({
      page: Number(page),
      limit: Number(limit),
      sort,
      order,
      q,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });

    return res.success(result, 200, "도서 목록 조회 완료");
  } catch (err) {
    next(err);
  }
}

/**
 * GET /books/:id
 */
export async function getBookByIdController(req, res, next) {
  try {
    const bookId = Number(req.params.id);
    const book = await getBookById(bookId);

    return res.success({ book }, 200, "도서 상세 조회 완료");
  } catch (err) {
    if (err.message === "BOOK_NOT_FOUND") {
      return res.fail("도서를 찾을 수 없습니다", 404, "RESOURCE_NOT_FOUND");
    }
    next(err);
  }
}

/**
 * GET /books/:id/reviews
 */
export async function getReviews(req, res, next) {
  try {
    const bookId = Number(req.params.id);
    const { page = 1, limit = 10 } = req.query;

    const result = await getBookReviews({
      bookId,
      page: Number(page),
      limit: Number(limit),
    });

    return res.success(result, 200, "리뷰 목록 조회 완료");
  } catch (err) {
    next(err);
  }
}

/**
 * GET /books/:id/stats
 */
export async function getStats(req, res, next) {
  try {
    const bookId = Number(req.params.id);
    const stats = await getBookStats(bookId);

    return res.success(stats, 200, "도서 통계 조회 완료");
  } catch (err) {
    next(err);
  }
}

/**
 * POST /books
 */
export async function createBookController(req, res, next) {
  try {
    const book = await createBook(req.body);
    return res.success({ book }, 201, "도서 등록 완료");
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /books/:id
 */
export async function updateBookController(req, res, next) {
  try {
    const bookId = Number(req.params.id);
    const book = await updateBook(bookId, req.body);

    return res.success({ book }, 200, "도서 수정 완료");
  } catch (err) {
    if (err.message === "BOOK_NOT_FOUND") {
      return res.fail("도서를 찾을 수 없습니다", 404, "RESOURCE_NOT_FOUND");
    }
    next(err);
  }
}

/**
 * DELETE /books/:id
 */
export async function deleteBookController(req, res, next) {
  try {
    const bookId = Number(req.params.id);
    await deleteBook(bookId);

    return res.success({}, 200, "도서 삭제 완료");
  } catch (err) {
    if (err.message === "BOOK_NOT_FOUND") {
      return res.fail("도서를 찾을 수 없습니다", 404, "RESOURCE_NOT_FOUND");
    }
    next(err);
  }
}