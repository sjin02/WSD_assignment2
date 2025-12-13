import prisma from "../prisma/client.js";

export async function createReview({ userId, bookId, rating, comment }) {
  return prisma.review.create({
    data: {
      userId,
      bookId,
      rating,
      comment,
    },
  });
}

export async function updateReview({ reviewId, userId, rating, comment }) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) throw new Error("REVIEW_NOT_FOUND");
  if (review.userId !== userId) throw new Error("FORBIDDEN");

  return prisma.review.update({
    where: { id: reviewId },
    data: { rating, comment },
  });
}

export async function deleteReview({ reviewId, userId }) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });

  if (!review) throw new Error("REVIEW_NOT_FOUND");
  if (review.userId !== userId) throw new Error("FORBIDDEN");

  return prisma.review.delete({ where: { id: reviewId } });
}

export async function getMyReviews({ userId, page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        book: { select: { id: true, title: true } },
      },
    }),
    prisma.review.count({ where: { userId } }),
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
