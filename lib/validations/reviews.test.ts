import { describe, expect, it } from "vitest";

import { ReviewCreateSchema } from "@/lib/validations/reviews";

describe("review validation", () => {
  it("accepts valid review payload", () => {
    const result = ReviewCreateSchema.safeParse({
      assignment_id: "550e8400-e29b-41d4-a716-446655440000",
      reviewee_id: "550e8400-e29b-41d4-a716-446655440001",
      rating: 5,
      review_text: "Great shift experience",
    });

    expect(result.success).toBe(true);
  });

  it("rejects out-of-range rating", () => {
    const result = ReviewCreateSchema.safeParse({
      assignment_id: "550e8400-e29b-41d4-a716-446655440000",
      reviewee_id: "550e8400-e29b-41d4-a716-446655440001",
      rating: 6,
    });

    expect(result.success).toBe(false);
  });
});
