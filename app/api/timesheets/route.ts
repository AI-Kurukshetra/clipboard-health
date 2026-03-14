import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { TimesheetActionSchema, TimesheetQuerySchema } from "@/lib/validations/timesheets";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = TimesheetQuerySchema.safeParse({
    assignment_id: searchParams.get("assignment_id") ?? undefined,
    scope: searchParams.get("scope") ?? "worker",
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid timesheet query", details: parsed.error.flatten() },
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

  let query = supabase.from("timesheets").select("*");
  if (parsed.data.assignment_id) {
    query = query.eq("assignment_id", parsed.data.assignment_id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = TimesheetActionSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid timesheet payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  if (parsed.data.action === "clock_in") {
    const { data: existing, error: existingError } = await supabase
      .from("timesheets")
      .select("id")
      .eq("assignment_id", parsed.data.assignment_id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 400 });
    }

    if (existing) {
      const { data, error } = await supabase
        .from("timesheets")
        .update({ clock_in_time: new Date().toISOString() })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ data });
    }

    const { data, error } = await supabase
      .from("timesheets")
      .insert({
        assignment_id: parsed.data.assignment_id,
        clock_in_time: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data }, { status: 201 });
  }

  const { data, error } = await supabase
    .from("timesheets")
    .update({ clock_out_time: new Date().toISOString() })
    .eq("assignment_id", parsed.data.assignment_id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
