import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ShiftCreateSchema, ShiftQuerySchema } from "@/lib/validations/shifts";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = ShiftQuerySchema.safeParse({
    specialty: searchParams.get("specialty") ?? undefined,
    date: searchParams.get("date") ?? undefined,
    urgent: searchParams.get("urgent") ?? undefined,
    min_rate: searchParams.get("min_rate") ?? undefined,
    sort: searchParams.get("sort") ?? "newest",
    status: searchParams.get("status") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query params", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  let query = supabase.from("shifts").select("*");

  if (parsed.data.specialty) {
    query = query.eq("specialty_required", parsed.data.specialty);
  }

  if (parsed.data.date) {
    query = query.eq("shift_date", parsed.data.date);
  }

  if (parsed.data.urgent) {
    query = query.eq("urgent_flag", parsed.data.urgent === "true");
  }

  if (typeof parsed.data.min_rate === "number") {
    query = query.gte("hourly_rate", parsed.data.min_rate);
  }

  if (parsed.data.status) {
    query = query.eq("status", parsed.data.status);
  }

  if (parsed.data.sort === "highest_pay") {
    query = query.order("hourly_rate", { ascending: false });
  } else if (parsed.data.sort === "date") {
    query = query.order("shift_date", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = ShiftCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid shift payload", details: parsed.error.flatten() },
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
    .from("shifts")
    .insert({
      ...parsed.data,
      created_by: user.id,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
