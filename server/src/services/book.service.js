import prisma from "../prisma/client.js";

/**
 * GET /books
 * 검색 / 정렬 / 페이지네이션
 */
export async function getBooks({
  page = 1,
  limit = 20,
  sort = "createdAt",
  order = "desc",
  q,
  minPrice,
  maxPrice,
}) {
  const skip = (page - 1) * limit;

  const where = {
    deletedAt: null,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { author: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...((minPrice || maxPrice) && {
      price: {
        ...(minPrice && { gte: minPrice }),
        ...(maxPrice && { lte: maxPrice }),
      },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      select: {
        id: true,
        title: true,
        author: true,
        price: true,
        stock: true,
        coverImageUrl: true,
        createdAt: true,
      },
    }),
    prisma.book.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      hasNext: skip + items.length < total,
    },
  };
}

/**
 * GET /books/:id
 * 도서 상세 조회
 */
export async function getBookById(bookId) {
  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
      deletedAt: null,
    },
  });

  if (!book) {
    throw new Error("BOOK_NOT_FOUND");
  }

  return book;
}

/**
 * GET /books/:id/reviews
 * 특정 도서 리뷰 조회 (페이지네이션)
 */
export async function getBookReviews({
  bookId,
  page = 1,
  limit = 10,
}) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where: { bookId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.review.count({ where: { bookId } }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      hasNext: skip + items.length < total,
    },
  };
}

/**
 * GET /books/:id/stats
 * 평점 평균 / 리뷰 수 / 찜 수
 */
export async function getBookStats(bookId) {
  const [reviewAgg, favoriteCount] = await Promise.all([
    prisma.review.aggregate({
      where: { bookId },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.favorite.count({ where: { bookId } }),
  ]);

  return {
    averageRating: reviewAgg._avg.rating ?? 0,
    reviewCount: reviewAgg._count,
    favoriteCount,
  };
}

/**
 * POST /books
 * 도서 등록 (SELLER / ADMIN)
 */
export async function createBook(data) {
  return prisma.book.create({ data });
}

/**
 * PATCH /books/:id
 * 도서 수정
 */
export async function updateBook(bookId, data) {
  const book = await prisma.book.findFirst({
    where: { id: bookId, deletedAt: null },
  });

  if (!book) {
    throw new Error("BOOK_NOT_FOUND");
  }

  return prisma.book.update({
    where: { id: bookId },
    data,
  });
}

/**
 * DELETE /books/:id
 * 도서 soft delete
 */
export async function deleteBook(bookId) {
  const book = await prisma.book.findFirst({
    where: { id: bookId, deletedAt: null },
  });

  if (!book) {
    throw new Error("BOOK_NOT_FOUND");
  }

  return prisma.book.update({
    where: { id: bookId },
    data: { deletedAt: new Date() },
  });
}