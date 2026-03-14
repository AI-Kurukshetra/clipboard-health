import { z } from "zod";

export const AssignmentStatusSchema = z.enum(["assigned", "in_progress", "completed", "cancelled"]);

export const AssignmentCreateSchema = z.object({
  shift_id: z.string().uuid(),
  worker_id: z.string().uuid(),
  application_id: z.string().uuid().optional(),
});

export const AssignmentUpdateSchema = z.object({
  assignment_id: z.string().uuid(),
  assignment_status: AssignmentStatusSchema,
});

export const AssignmentQuerySchema = z.object({
  shift_id: z.string().uuid().optional(),
  scope: z.enum(["worker", "facility"]).default("worker"),
  status: AssignmentStatusSchema.optional(),
});

export type AssignmentCreateInput = z.infer<typeof AssignmentCreateSchema>;
export type AssignmentUpdateInput = z.infer<typeof AssignmentUpdateSchema>;
export type AssignmentQueryInput = z.infer<typeof AssignmentQuerySchema>;
