import { z } from "zod";

export const MessageQuerySchema = z.object({
  conversation_id: z.string().uuid().optional(),
});

export const CreateConversationSchema = z.object({
  type: z.literal("conversation"),
  participant_ids: z.array(z.string().uuid()).min(1).max(20),
  shift_id: z.string().uuid().optional(),
  facility_id: z.string().uuid().optional(),
});

export const SendMessageSchema = z.object({
  type: z.literal("message"),
  conversation_id: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

export const MessageActionSchema = z.discriminatedUnion("type", [
  CreateConversationSchema,
  SendMessageSchema,
]);

export type MessageActionInput = z.infer<typeof MessageActionSchema>;
