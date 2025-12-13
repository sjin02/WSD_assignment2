import { z } from "zod";

export const adminUpdateUserDto = z.object({
  role: z.enum(["USER", "SELLER", "ADMIN"]).optional(),
  resetPassword: z.boolean().optional(),
  restore: z.boolean().optional(),
}).refine(
  (data) => data.role || data.resetPassword || data.restore,
  {
    message: "변경할 항목이 최소 하나는 필요합니다",
  }
);
