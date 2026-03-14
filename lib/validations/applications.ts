import { z } from "zod";

export const ApplicationStatusSchema = z.enum(["applied", "accepted", "rejected", "cancelled"]);

export const ApplicationCreateSchema = z.object({
  shift_id: z.string().uuid(),
});

export const ApplicationStatusUpdateSchema = z.object({
  application_id: z.string().uuid(),
  application_status: ApplicationStatusSchema,
});

export const ApplicationQuerySchema = z.object({
  shift_id: z.string().uuid().optional(),
  scope: z.enum(["worker", "facility"]).default("worker"),
  status: ApplicationStatusSchema.optional(),
});

export type ApplicationCreateInput = z.infer<typeof ApplicationCreateSchema>;
export type ApplicationQueryInput = z.infer<typeof ApplicationQuerySchema>;
export type ApplicationStatusUpdateInput = z.infer<typeof ApplicationStatusUpdateSchema>;
