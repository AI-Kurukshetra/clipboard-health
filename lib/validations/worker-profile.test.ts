import { describe, expect, it } from "vitest";

import { WorkerProfileSchema } from "@/lib/validations/worker-profile";

describe("worker profile validation", () => {
  it("accepts valid worker profile", () => {
    const result = WorkerProfileSchema.safeParse({
      full_name: "Jane Doe",
      phone: "1234567890",
      location: "Austin, TX",
      specialty: "RN",
      years_experience: 5,
      bio: "Night shift nurse",
    });

    expect(result.success).toBe(true);
  });

  it("rejects negative experience", () => {
    const result = WorkerProfileSchema.safeParse({
      full_name: "Jane Doe",
      phone: "1234567890",
      location: "Austin, TX",
      specialty: "RN",
      years_experience: -1,
    });

    expect(result.success).toBe(false);
  });
});
