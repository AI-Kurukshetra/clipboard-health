import { z } from "zod";

export const AvailabilitySlotSchema = z
  .object({
    day_of_week: z.number().int().min(0).max(6),
    start_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
    end_time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/),
    preference_note: z.string().max(250).optional().default(""),
  })
  .refine((value) => value.start_time < value.end_time, {
    message: "start_time must be before end_time",
    path: ["end_time"],
  });

export const AvailabilityPayloadSchema = z.object({
  slots: z.array(AvailabilitySlotSchema).max(50),
});

export type AvailabilitySlotInput = z.infer<typeof AvailabilitySlotSchema>;
export type AvailabilityPayloadInput = z.infer<typeof AvailabilityPayloadSchema>;
