import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  AssignmentCreateSchema,
  AssignmentQuerySchema,
  AssignmentUpdateSchema,
} from "@/lib/validations/assignments";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = AssignmentQuerySchema.safeParse({
    shift_id: searchParams.get("shift_id") ?? undefined,
    scope: searchParams.get("scope") ?? "worker",
    status: searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid assignment query", details: parsed.error.flatten() },
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

  let query = supabase.from("assignments").select("*");

  if (parsed.data.scope === "worker") {
    query = query.eq("worker_id", user.id);
  }

  if (parsed.data.shift_id) {
    query = query.eq("shift_id", parsed.data.shift_id);
  }

  if (parsed.data.status) {
    query = query.eq("assignment_status", parsed.data.status);
  }

  const { data, error } = await query.order("assigned_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = AssignmentCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid assignment payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("assignments")
    .insert({
      shift_id: parsed.data.shift_id,
      worker_id: parsed.data.worker_id,
      application_id: parsed.data.application_id,
      assignment_status: "assigned",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (parsed.data.application_id) {
    await supabase
      .from("applications")
      .update({ application_status: "accepted" })
      .eq("id", parsed.data.application_id);
  }

  await supabase.from("shifts").update({ status: "assigned" }).eq("id", parsed.data.shift_id);

  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const parsed = AssignmentUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid assignment update payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assignments")
    .update({ assignment_status: parsed.data.assignment_status })
    .eq("id", parsed.data.assignment_id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
