import {
  adminGetOrders,
  adminUpdateOrderStatus,
} from "../services/order.service.js";
import { adminListOrdersQueryDto, adminUpdateOrderStatusDto } from "../dtos/order.dto.js";

export async function adminListOrders(req, res, next) {
  try {
    const q = adminListOrdersQueryDto.parse(req.query);

    const result = await adminGetOrders({
      page: q.page,
      limit: q.limit,
      sort: q.sort,
      order: q.order,
      status: q.status,
      userId: q.userId,
      q: q.q,
    });

    return res.success(result, 200, "전체 주문 목록 조회 완료");
  } catch (err) {
    next(err);
  }
}

export async function adminPatchOrderStatus(req, res, next) {
  try {
    const orderId = Number(req.params.id);
    const dto = adminUpdateOrderStatusDto.parse(req.body);

    const updated = await adminUpdateOrderStatus(orderId, dto.status);
    return res.success(updated, 200, "주문 상태 변경 완료");
  } catch (err) {
    next(err);
  }
}
