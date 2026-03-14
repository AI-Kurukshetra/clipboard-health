import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { MessageActionSchema, MessageQuerySchema } from "@/lib/validations/messages";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = MessageQuerySchema.safeParse({
    conversation_id: searchParams.get("conversation_id") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid message query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (parsed.data.conversation_id) {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", parsed.data.conversation_id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  }

  const { data: participantRows, error: participantError } = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);

  if (participantError) {
    return NextResponse.json({ error: participantError.message }, { status: 400 });
  }

  const conversationIds = participantRows.map((row) => row.conversation_id);
  if (conversationIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .in("id", conversationIds)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = MessageActionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid message payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (parsed.data.type === "conversation") {
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        created_by: user.id,
        shift_id: parsed.data.shift_id,
        facility_id: parsed.data.facility_id,
      })
      .select("*")
      .single();

    if (conversationError) {
      return NextResponse.json({ error: conversationError.message }, { status: 400 });
    }

    const participantSet = new Set(parsed.data.participant_ids);
    participantSet.add(user.id);

    const participants = Array.from(participantSet).map((participantId) => ({
      conversation_id: conversation.id,
      user_id: participantId,
    }));

    const { error: participantInsertError } = await supabase
      .from("conversation_participants")
      .insert(participants);

    if (participantInsertError) {
      return NextResponse.json({ error: participantInsertError.message }, { status: 400 });
    }

    return NextResponse.json({ data: conversation }, { status: 201 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: parsed.data.conversation_id,
      sender_id: user.id,
      body: parsed.data.body,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
