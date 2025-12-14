import {
  createOrderFromCart,
  getMyOrders,
  getMyOrderDetail,
  cancelMyOrder,
} from "../services/order.service.js";
import { listOrdersQueryDto } from "../dtos/order.dto.js";

export async function createOrder(req, res, next) {
  try {
    const userId = req.user.userId;
    const order = await createOrderFromCart(userId);
    return res.success({ order }, 201, "주문 생성 완료");
  } catch (err) {
    next(err);
  }
}

export async function listMyOrders(req, res, next) {
  try {
    const userId = req.user.userId;
    const q = listOrdersQueryDto.parse(req.query);

    const result = await getMyOrders({
      userId,
      page: q.page,
      limit: q.limit,
      sort: q.sort,
      order: q.order,
      status: q.status,
    });

    return res.success(
      { orders: result.items, meta: result.meta },
      200,
      "내 주문 목록 조회 완료",
    );
  } catch (err) {
    next(err);
  }
}

export async function getMyOrder(req, res, next) {
  try {
    const userId = req.user.userId;
    const orderId = Number(req.params.id);
    const order = await getMyOrderDetail(userId, orderId);
    return res.success({ order }, 200, "주문 상세 조회 완료");
  } catch (err) {
    next(err);
  }
}

export async function cancelOrder(req, res, next) {
  try {
    const userId = req.user.userId;
    const orderId = Number(req.params.id);
    const order = await cancelMyOrder(userId, orderId);
    return res.success({ order }, 200, "주문 취소 완료");
  } catch (err) {
    next(err);
  }
}
