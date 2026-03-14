import { describe, expect, it } from "vitest";

import { FacilityProfileSchema } from "@/lib/validations/facility-profile";

describe("facility profile validation", () => {
  it("accepts valid facility profile", () => {
    const result = FacilityProfileSchema.safeParse({
      contact_name: "Alice Admin",
      phone: "1234567890",
      organization_name: "Care Group",
    });

    expect(result.success).toBe(true);
  });

  it("rejects missing organization", () => {
    const result = FacilityProfileSchema.safeParse({
      contact_name: "Alice Admin",
      phone: "1234567890",
      organization_name: "",
    });

    expect(result.success).toBe(false);
  });
});
