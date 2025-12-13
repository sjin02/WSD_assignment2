import { z } from "zod";

export const createReviewDto = z.object({
  rating: z
    .number()
    .int()
    .min(1, "평점은 최소 1점입니다")
    .max(5, "평점은 최대 5점입니다")
    .optional(),

  comment: z
    .string()
    .min(5, "리뷰는 최소 5자 이상이어야 합니다")
    .max(2000, "리뷰는 최대 2000자까지 가능합니다"),
});

export const updateReviewDto = z.object({
  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional(),

  comment: z
    .string()
    .min(5)
    .max(2000)
    .optional(),
}).refine(
  (data) => data.rating !== undefined || data.comment !== undefined,
  {
    message: "수정할 항목이 최소 하나는 필요합니다",
  }
);
