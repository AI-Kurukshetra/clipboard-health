import { z } from "zod";

export const ShiftStatusSchema = z.enum(["open", "assigned", "completed", "cancelled"]);

export const ShiftCreateSchema = z
  .object({
    facility_id: z.string().uuid(),
    title: z.string().min(2).max(160),
    department: z.string().max(120).optional(),
    specialty_required: z.string().max(120).optional(),
    shift_date: z.string().date(),
    start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
    end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
    hourly_rate: z.number().positive(),
    workers_needed: z.number().int().min(1).max(100),
    location: z.string().max(255).optional(),
    description: z.string().max(2000).optional(),
    urgent_flag: z.boolean().default(false),
  })
  .refine((value) => value.start_time < value.end_time, {
    message: "start_time must be before end_time",
    path: ["end_time"],
  });

export const ShiftQuerySchema = z.object({
  specialty: z.string().optional(),
  date: z.string().date().optional(),
  urgent: z.enum(["true", "false"]).optional(),
  min_rate: z.coerce.number().optional(),
  sort: z.enum(["newest", "highest_pay", "date"]).default("newest"),
  status: ShiftStatusSchema.optional(),
});

export type ShiftCreateInput = z.infer<typeof ShiftCreateSchema>;
export type ShiftQueryInput = z.infer<typeof ShiftQuerySchema>;
