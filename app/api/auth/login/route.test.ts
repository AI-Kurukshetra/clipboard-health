import { describe, expect, it } from "vitest";

import { POST } from "@/app/api/auth/login/route";

describe("POST /api/auth/login", () => {
  it("returns 400 for invalid payload", async () => {
    const request = new Request("http://localhost/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "not-an-email",
        password: "short",
      }),
    });

    const response = await POST(request);
    const payload = (await response.json()) as { error?: string };

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Invalid login payload");
  });
});
