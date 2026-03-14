import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/timesheets/route";

describe("POST /api/timesheets", () => {
  it("returns 400 for invalid payload", async () => {
    const request = new Request("http://localhost/api/timesheets", {
      method: "POST",
      body: JSON.stringify({
        action: "invalid",
        assignment_id: "bad-id",
      }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Invalid timesheet payload");
  });
});
