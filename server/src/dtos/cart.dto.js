import { z } from "zod";

export const addCartItemDto = z.object({
  bookId: z.number().int().positive(),
  quantity: z.number().int().min(1).max(100),
});

export const updateCartItemDto = z.object({
  quantity: z.number().int().min(1).max(100),
});
