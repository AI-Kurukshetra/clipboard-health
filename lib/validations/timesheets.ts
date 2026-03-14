import { z } from "zod";

export const TimesheetActionSchema = z.object({
  action: z.enum(["clock_in", "clock_out"]),
  assignment_id: z.string().uuid(),
});

export const TimesheetQuerySchema = z.object({
  assignment_id: z.string().uuid().optional(),
  scope: z.enum(["worker", "facility"]).default("worker"),
});

export type TimesheetActionInput = z.infer<typeof TimesheetActionSchema>;
export type TimesheetQueryInput = z.infer<typeof TimesheetQuerySchema>;
