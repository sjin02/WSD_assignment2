import {
  getOrCreateCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../services/cart.service.js";
import { addCartItemDto, updateCartItemDto } from "../dtos/cart.dto.js";

export async function getMyCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req.user.userId);
    res.success({ cart }, 200, "장바구니 조회 완료");
  } catch (err) {
    next(err);
  }
}

export async function addCartItem(req, res, next) {
  try {
    const dto = addCartItemDto.parse(req.body);
    const item = await addItemToCart(req.user.userId, dto);
    res.success({ cartItem: item }, 201, "장바구니에 추가되었습니다");
  } catch (err) {
    next(err);
  }
}

export async function updateCartItemQty(req, res, next) {
  try {
    const itemId = Number(req.params.itemId);
    const dto = updateCartItemDto.parse(req.body);

    const item = await updateCartItem(
      req.user.userId,
      itemId,
      dto.quantity
    );

    res.success({ cartItem: item }, 200, "수량 변경 완료");
  } catch (err) {
    next(err);
  }
}

export async function deleteCartItem(req, res, next) {
  try {
    const itemId = Number(req.params.itemId);
    await removeCartItem(req.user.userId, itemId);
    res.success({}, 200, "항목 삭제 완료");
  } catch (err) {
    next(err);
  }
}

export async function clearMyCart(req, res, next) {
  try {
    await clearCart(req.user.userId);
    res.success({}, 200, "장바구니 비우기 완료");
  } catch (err) {
    next(err);
  }
}
