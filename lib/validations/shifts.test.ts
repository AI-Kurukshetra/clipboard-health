import { describe, expect, it } from "vitest";

import { ShiftCreateSchema } from "@/lib/validations/shifts";

describe("shift validation", () => {
  it("accepts valid shift payload", () => {
    const result = ShiftCreateSchema.safeParse({
      facility_id: "550e8400-e29b-41d4-a716-446655440000",
      title: "RN - Day Shift",
      shift_date: "2026-03-20",
      start_time: "08:00",
      end_time: "16:00",
      hourly_rate: 45,
      workers_needed: 2,
      urgent_flag: false,
    });

    expect(result.success).toBe(true);
  });

  it("rejects negative hourly rate", () => {
    const result = ShiftCreateSchema.safeParse({
      facility_id: "550e8400-e29b-41d4-a716-446655440000",
      title: "RN - Day Shift",
      shift_date: "2026-03-20",
      start_time: "08:00",
      end_time: "16:00",
      hourly_rate: -5,
      workers_needed: 1,
    });

    expect(result.success).toBe(false);
  });
});
