import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(20),
  name: z.string().min(1).max(50),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).max(50).optional(),
});
