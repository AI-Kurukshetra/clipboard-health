import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import {
  ApplicationCreateSchema,
  ApplicationQuerySchema,
  ApplicationStatusUpdateSchema,
} from "@/lib/validations/applications";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = ApplicationQuerySchema.safeParse({
    shift_id: searchParams.get("shift_id") ?? undefined,
    scope: searchParams.get("scope") ?? "worker",
    status: searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application query", details: parsed.error.flatten() },
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

  let query = supabase.from("applications").select("*");

  if (parsed.data.scope === "worker") {
    query = query.eq("worker_id", user.id);
  }

  if (parsed.data.shift_id) {
    query = query.eq("shift_id", parsed.data.shift_id);
  }

  if (parsed.data.status) {
    query = query.eq("application_status", parsed.data.status);
  }

  query = query.order("applied_at", { ascending: false });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = ApplicationCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application payload", details: parsed.error.flatten() },
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

  const { data, error } = await supabase
    .from("applications")
    .insert({
      shift_id: parsed.data.shift_id,
      worker_id: user.id,
      application_status: "applied",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 201 });
}

export async function PATCH(request: Request) {
  const payload = await request.json();
  const parsed = ApplicationStatusUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid application update payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ application_status: parsed.data.application_status })
    .eq("id", parsed.data.application_id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
