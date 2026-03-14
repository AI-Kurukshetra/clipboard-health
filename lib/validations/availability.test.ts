import { describe, expect, it } from "vitest";

import { AvailabilityPayloadSchema } from "@/lib/validations/availability";

describe("availability validation", () => {
  it("accepts valid slots", () => {
    const result = AvailabilityPayloadSchema.safeParse({
      slots: [
        {
          day_of_week: 1,
          start_time: "08:00",
          end_time: "16:00",
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid time order", () => {
    const result = AvailabilityPayloadSchema.safeParse({
      slots: [
        {
          day_of_week: 1,
          start_time: "18:00",
          end_time: "16:00",
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});
