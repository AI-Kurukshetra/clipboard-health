import { z } from "zod";

export const ReviewCreateSchema = z.object({
  assignment_id: z.string().uuid(),
  reviewee_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().max(2000).optional().default(""),
});

export const ReviewUpdateSchema = z.object({
  review_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review_text: z.string().max(2000).optional().default(""),
});

export const ReviewQuerySchema = z.object({
  assignment_id: z.string().uuid().optional(),
  reviewee_id: z.string().uuid().optional(),
});

export type ReviewCreateInput = z.infer<typeof ReviewCreateSchema>;
export type ReviewUpdateInput = z.infer<typeof ReviewUpdateSchema>;
export type ReviewQueryInput = z.infer<typeof ReviewQuerySchema>;
