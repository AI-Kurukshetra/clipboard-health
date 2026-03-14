import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { DocumentRecordSchema } from "@/lib/validations/documents";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [licensesResult, certificationsResult] = await Promise.all([
    supabase.from("licenses").select("*").eq("worker_id", user.id).order("created_at", { ascending: false }),
    supabase
      .from("certifications")
      .select("*")
      .eq("worker_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  if (licensesResult.error) {
    return NextResponse.json({ error: licensesResult.error.message }, { status: 400 });
  }

  if (certificationsResult.error) {
    return NextResponse.json({ error: certificationsResult.error.message }, { status: 400 });
  }

  return NextResponse.json({
    licenses: licensesResult.data,
    certifications: certificationsResult.data,
  });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = DocumentRecordSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid document payload", details: parsed.error.flatten() },
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

  const record = parsed.data;
  if (record.document_kind === "license") {
    const { data, error } = await supabase
      .from("licenses")
      .insert({
        worker_id: user.id,
        license_type: record.document_type,
        license_number: record.identifier,
        issuing_authority: record.issuer,
        issue_date: record.issue_date,
        expiry_date: record.expiry_date,
        storage_path: record.storage_path,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  }

  const { data, error } = await supabase
    .from("certifications")
    .insert({
      worker_id: user.id,
      certification_type: record.document_type,
      issuer: record.issuer,
      issue_date: record.issue_date,
      expiry_date: record.expiry_date,
      storage_path: record.storage_path,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ data });
}
