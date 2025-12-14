import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(20),
  name: z.string().min(1).max(50),
});

export const updateUserSchema = z
  .object({
    name: z.string().min(1).max(50).optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "수정할 값이 최소 하나 이상 필요합니다",
    }
  );

