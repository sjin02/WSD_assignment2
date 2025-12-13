import { z } from "zod";

export const listOrdersQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["createdAt", "totalAmount", "status"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
});

export const adminListOrdersQueryDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(["createdAt", "totalAmount", "status"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
  status: z.enum(["PENDING", "PAID", "CANCELLED"]).optional(),
  userId: z.coerce.number().int().positive().optional(),
  q: z.string().min(1).optional(), // 사용자 email/name 검색용
});

export const adminUpdateOrderStatusDto = z.object({
  status: z.enum(["PENDING", "PAID", "CANCELLED"]),
});
