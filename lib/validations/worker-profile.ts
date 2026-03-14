import { z } from "zod";

export const WorkerProfileSchema = z.object({
  full_name: z.string().min(2).max(120),
  phone: z.string().min(7).max(20),
  location: z.string().min(2).max(255),
  specialty: z.string().min(2).max(100),
  years_experience: z.number().int().min(0).max(60),
  bio: z.string().max(1000).optional().default(""),
});

export type WorkerProfileInput = z.infer<typeof WorkerProfileSchema>;
