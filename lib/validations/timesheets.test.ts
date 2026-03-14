import { describe, expect, it } from "vitest";

import { TimesheetActionSchema } from "@/lib/validations/timesheets";

describe("timesheet validation", () => {
  it("accepts clock in payload", () => {
    const result = TimesheetActionSchema.safeParse({
      action: "clock_in",
      assignment_id: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid assignment id", () => {
    const result = TimesheetActionSchema.safeParse({
      action: "clock_out",
      assignment_id: "bad-id",
    });

    expect(result.success).toBe(false);
  });
});
