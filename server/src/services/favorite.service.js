import prisma from "../prisma/client.js";

export async function addFavorite({ userId, bookId }) {
  return prisma.favorite.create({
    data: { userId, bookId },
  });
}

export async function removeFavorite({ userId, bookId }) {
  return prisma.favorite.delete({
    where: {
      userId_bookId: { userId, bookId },
    },
  });
}

export async function getMyFavorites({ userId, page = 1, limit = 10 }) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { id: "desc" },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            price: true,
            coverImageUrl: true,
          },
        },
      },
    }),
    prisma.favorite.count({ where: { userId } }),
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
