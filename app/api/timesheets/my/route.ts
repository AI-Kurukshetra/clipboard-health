import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: assignments, error: assignmentError } = await supabase
    .from("assignments")
    .select("id")
    .eq("worker_id", user.id);

  if (assignmentError) {
    return NextResponse.json({ error: assignmentError.message }, { status: 400 });
  }

  const assignmentIds = assignments.map((assignment) => assignment.id);
  if (assignmentIds.length === 0) {
    return NextResponse.json({ data: [] });
  }

  const { data, error } = await supabase
    .from("timesheets")
    .select("*")
    .in("assignment_id", assignmentIds)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
