import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { ReviewCreateSchema, ReviewQuerySchema, ReviewUpdateSchema } from "@/lib/validations/reviews";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = ReviewQuerySchema.safeParse({
    assignment_id: searchParams.get("assignment_id") ?? undefined,
    reviewee_id: searchParams.get("reviewee_id") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review query", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  let query = supabase.from("reviews").select("*");

  if (parsed.data.assignment_id) {
    query = query.eq("assignment_id", parsed.data.assignment_id);
  }

  if (parsed.data.reviewee_id) {
    query = query.eq("reviewee_id", parsed.data.reviewee_id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = ReviewCreateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review payload", details: parsed.error.flatten() },
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

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("assignment_status")
    .eq("id", parsed.data.assignment_id)
    .maybeSingle();

  if (assignmentError) {
    return NextResponse.json({ error: assignmentError.message }, { status: 400 });
  }

  if (!assignment || assignment.assignment_status !== "completed") {
    return NextResponse.json(
      { error: "Reviews can only be submitted for completed assignments" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("reviews")
    .insert({
      assignment_id: parsed.data.assignment_id,
      reviewer_id: user.id,
      reviewee_id: parsed.data.reviewee_id,
      rating: parsed.data.rating,
      review_text: parsed.data.review_text,
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
  const parsed = ReviewUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid review update payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .update({
      rating: parsed.data.rating,
      review_text: parsed.data.review_text,
    })
    .eq("id", parsed.data.review_id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
