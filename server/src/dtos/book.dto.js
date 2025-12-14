import { z } from "zod";

export const createBookSchema = z
  .object({
    title: z.string().min(1),
    price: z.number().int().positive(),
    stock: z.number().int().nonnegative(),

    author: z.string().optional(),
    isbn: z.string().optional(),
    description: z.string().optional(),
    coverImageUrl: z.string().url().optional(),
  })
  .strict();
