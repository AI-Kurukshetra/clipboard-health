import { describe, expect, it } from "vitest";

import { LoginSchema, SignUpSchema } from "@/lib/validations/auth";

describe("auth validation", () => {
  it("accepts signup payload", () => {
    const result = SignUpSchema.safeParse({
      email: "nurse@example.com",
      password: "longpassword",
      role: "healthcare_worker",
    });

    expect(result.success).toBe(true);
  });

  it("rejects short password", () => {
    const result = LoginSchema.safeParse({
      email: "nurse@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });
});
