import { describe, expect, it } from "vitest";

import { ApplicationCreateSchema } from "@/lib/validations/applications";

describe("application validation", () => {
  it("accepts valid create payload", () => {
    const result = ApplicationCreateSchema.safeParse({
      shift_id: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid shift id", () => {
    const result = ApplicationCreateSchema.safeParse({
      shift_id: "not-uuid",
    });

    expect(result.success).toBe(false);
  });
});
