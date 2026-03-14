import { z } from "zod";

export const UserRoleSchema = z.enum(["healthcare_worker", "facility_admin"]);

export const SignUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: UserRoleSchema.default("healthcare_worker"),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const LogoutSchema = z.object({
  scope: z.enum(["local", "global"]).default("local"),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type LogoutInput = z.infer<typeof LogoutSchema>;
