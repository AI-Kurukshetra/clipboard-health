import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { UploadUrlSchema } from "@/lib/validations/documents";

const DOCUMENT_BUCKET = "worker-documents";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = UploadUrlSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid upload payload", details: parsed.error.flatten() },
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

  const filePath = `${user.id}/${parsed.data.document_kind}/${Date.now()}-${parsed.data.file_name}`;
  const { data, error } = await supabase.storage.from(DOCUMENT_BUCKET).createSignedUploadUrl(filePath);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({
    bucket: DOCUMENT_BUCKET,
    path: filePath,
    token: data.token,
    signedUrl: data.signedUrl,
  });
}
