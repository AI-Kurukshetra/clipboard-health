import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type AppRole = "healthcare_worker" | "facility_admin" | "admin";

function normalizeRole(role: string | null | undefined): AppRole {
  if (role === "facility_admin" || role === "admin") {
    return role;
  }

  return "healthcare_worker";
}

function readMetadataRole(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const maybeRole = Reflect.get(metadata, "role");
  return typeof maybeRole === "string" ? maybeRole : null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: roleRecord, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 400 });
  }

  const metadataRole = readMetadataRole(user.user_metadata);
  const role = normalizeRole(roleRecord?.role ?? metadataRole);

  return NextResponse.json({
    data: {
      id: user.id,
      email: user.email,
      role,
    },
  });
}
