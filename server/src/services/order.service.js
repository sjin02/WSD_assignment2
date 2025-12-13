import prisma from "../prisma/client.js";

/**
 * POST /orders
 * 내 장바구니 -> 주문 생성
 * - cart 비어있으면 409
 * - 재고 부족하면 409
 * - 트랜잭션: (주문 생성 + 재고 차감 + cart 비우기)
 */
export async function createOrderFromCart(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: { include: { book: true } },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw {
      status: 409,
      code: "STATE_CONFLICT",
      message: "장바구니가 비어있습니다",
    };
  }

  // 재고 체크 + 총액 계산
  let totalAmount = 0;
  for (const item of cart.items) {
    if (!item.book) {
      throw {
        status: 404,
        code: "RESOURCE_NOT_FOUND",
        message: "장바구니에 담긴 도서를 찾을 수 없습니다",
      };
    }
    if (item.book.stock < item.quantity) {
      throw {
        status: 409,
        code: "STATE_CONFLICT",
        message: `재고가 부족합니다 (bookId=${item.bookId})`,
      };
    }
    totalAmount += item.quantity * item.book.price;
  }

  const order = await prisma.$transaction(async (tx) => {
    // 주문 생성 (OrderItem에 unitPrice 스냅샷 저장)
    const created = await tx.order.create({
      data: {
        userId,
        totalAmount,
        status: "PENDING",
        items: {
          create: cart.items.map((item) => ({
            bookId: item.bookId,
            quantity: item.quantity,
            unitPrice: item.book.price,
          })),
        },
      },
      include: {
        items: { include: { book: true } },
      },
    });

    // 재고 차감
    for (const item of cart.items) {
      await tx.book.update({
        where: { id: item.bookId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    // 장바구니 비우기
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return created;
  });

  return order;
}

/**
 * GET /orders (내 주문 목록)
 */
export async function getMyOrders({ userId, page, limit, sort, order, status }) {
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(status && { status }),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        items: {
          include: {
            book: { select: { id: true, title: true, coverImageUrl: true } },
          },
        },
      },
    }),
    prisma.order.count({ where }),
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
 * GET /orders/:id (내 주문 상세)
 */
export async function getMyOrderDetail(userId, orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { book: true } },
    },
  });

  if (!order) {
    throw { status: 404, code: "RESOURCE_NOT_FOUND", message: "주문을 찾을 수 없습니다" };
  }
  if (order.userId !== userId) {
    throw { status: 403, code: "FORBIDDEN", message: "접근 권한이 없습니다" };
  }

  return order;
}

/**
 * POST /orders/:id/cancel (취소 행위)
 * - 이미 CANCELLED면 409
 * - PAID도 취소 가능/불가 정책은 프로젝트 선택인데,
 *   과제에서는 단순하게 "취소 가능"으로 두는 편이 무난.
 * - 취소 시 재고 복구 + 상태 변경 (트랜잭션)
 */
export async function cancelMyOrder(userId, orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) {
    throw { status: 404, code: "RESOURCE_NOT_FOUND", message: "주문을 찾을 수 없습니다" };
  }
  if (order.userId !== userId) {
    throw { status: 403, code: "FORBIDDEN", message: "접근 권한이 없습니다" };
  }
  if (order.status === "CANCELLED") {
    throw { status: 409, code: "STATE_CONFLICT", message: "이미 취소된 주문입니다" };
  }

  const result = await prisma.$transaction(async (tx) => {
    // 상태 변경
    const updated = await tx.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: { items: { include: { book: true } } },
    });

    // 재고 복구
    for (const item of order.items) {
      await tx.book.update({
        where: { id: item.bookId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return updated;
  });

  return result;
}

/**
 * GET /admin/orders (전체 주문 목록)
 * - 검색: q (user email or name)
 * - 필터: status, userId
 * - 페이지네이션/정렬
 */
export async function adminGetOrders({ page, limit, sort, order, status, userId, q }) {
  const skip = (page - 1) * limit;

  const where = {
    ...(status && { status }),
    ...(userId && { userId }),
    ...(q && {
      user: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
    }),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sort]: order },
      include: {
        user: { select: { id: true, email: true, name: true, role: true } },
        items: { include: { book: { select: { id: true, title: true } } } },
      },
    }),
    prisma.order.count({ where }),
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
 * PATCH /admin/orders/:id/status (상태 변경)
 */
export async function adminUpdateOrderStatus(orderId, status) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw { status: 404, code: "RESOURCE_NOT_FOUND", message: "주문을 찾을 수 없습니다" };
  }

  // (선택) 이미 CANCELLED인데 다른 상태로 바꾸는 걸 막고 싶다면:
  // if (order.status === "CANCELLED" && status !== "CANCELLED") { ... }

  return prisma.order.update({
    where: { id: orderId },
    data: { status },
  });
}
