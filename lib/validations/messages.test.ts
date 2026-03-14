import { describe, expect, it } from "vitest";

import { MessageActionSchema } from "@/lib/validations/messages";

describe("messaging validation", () => {
  it("accepts send message payload", () => {
    const result = MessageActionSchema.safeParse({
      type: "message",
      conversation_id: "550e8400-e29b-41d4-a716-446655440000",
      body: "Hello",
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid participant IDs", () => {
    const result = MessageActionSchema.safeParse({
      type: "conversation",
      participant_ids: ["bad-id"],
    });

    expect(result.success).toBe(false);
  });
});
