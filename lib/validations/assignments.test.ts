import { describe, expect, it } from "vitest";

import { AssignmentCreateSchema } from "@/lib/validations/assignments";

describe("assignment validation", () => {
  it("accepts valid create payload", () => {
    const result = AssignmentCreateSchema.safeParse({
      shift_id: "550e8400-e29b-41d4-a716-446655440000",
      worker_id: "550e8400-e29b-41d4-a716-446655440001",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid worker id", () => {
    const result = AssignmentCreateSchema.safeParse({
      shift_id: "550e8400-e29b-41d4-a716-446655440000",
      worker_id: "bad-id",
    });

    expect(result.success).toBe(false);
  });
});
