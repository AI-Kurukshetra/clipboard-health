import { z } from "zod";

export const FacilityProfileSchema = z.object({
  contact_name: z.string().min(2).max(120),
  phone: z.string().min(7).max(20),
  organization_name: z.string().min(2).max(160),
});

export type FacilityProfileInput = z.infer<typeof FacilityProfileSchema>;
