import { describe, expect, it } from "vitest";

import { requireEnv } from "@/lib/env";

describe("requireEnv", () => {
  it("returns value when present", () => {
    process.env.TEST_VALUE = "ok";
    expect(requireEnv("TEST_VALUE")).toBe("ok");
    delete process.env.TEST_VALUE;
  });

  it("throws when missing", () => {
    delete process.env.TEST_MISSING;
    expect(() => requireEnv("TEST_MISSING")).toThrow("Missing required environment variable");
  });
});
