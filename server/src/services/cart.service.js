import prisma from "../prisma/client.js";

/**
 * 내 장바구니 조회 (없으면 생성)
 */
export async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          book: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: { book: true },
        },
      },
    });
  }

  return cart;
}

/**
 * 장바구니에 책 추가
 */
export async function addItemToCart(userId, { bookId, quantity }) {
  const cart = await getOrCreateCart(userId);

  const existingItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      bookId,
    },
  });

  if (existingItem) {
    // 이미 있으면 수량 증가
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
      },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      bookId,
      quantity,
    },
  });
}

/**
 * 수량 변경
 */
export async function updateCartItem(userId, itemId, quantity) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== userId) {
    throw {
      status: 404,
      code: "RESOURCE_NOT_FOUND",
      message: "장바구니 항목을 찾을 수 없습니다",
    };
  }

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
}

/**
 * 항목 삭제
 */
export async function removeCartItem(userId, itemId) {
  const item = await prisma.cartItem.findUnique({
    where: { id: itemId },
    include: { cart: true },
  });

  if (!item || item.cart.userId !== userId) {
    throw {
      status: 404,
      code: "RESOURCE_NOT_FOUND",
      message: "장바구니 항목을 찾을 수 없습니다",
    };
  }

  await prisma.cartItem.delete({ where: { id: itemId } });
}

/**
 * 장바구니 비우기
 */
export async function clearCart(userId) {
  const cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) return;

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
}
