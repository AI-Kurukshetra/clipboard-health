import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { AvailabilityPayloadSchema } from "@/lib/validations/availability";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("availability")
    .select("id, day_of_week, start_time, end_time, preference_note")
    .eq("worker_id", user.id)
    .order("day_of_week", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const payload = await request.json();
  const parsed = AvailabilityPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid availability payload", details: parsed.error.flatten() },
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

  const { error: deleteError } = await supabase.from("availability").delete().eq("worker_id", user.id);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  if (parsed.data.slots.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const insertRows = parsed.data.slots.map((slot) => ({
    worker_id: user.id,
    day_of_week: slot.day_of_week,
    start_time: slot.start_time,
    end_time: slot.end_time,
    preference_note: slot.preference_note,
  }));

  const { data, error } = await supabase.from("availability").insert(insertRows).select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
