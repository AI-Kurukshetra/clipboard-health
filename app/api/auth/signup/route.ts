import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { SignUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = SignUpSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid signup payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { email, password, role } = parsed.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const userId = data.user?.id;
  if (role === "facility_admin" && userId) {
    const adminClient = createAdminClient();
    const { error: roleError } = await adminClient
      .from("user_roles")
      .upsert({ user_id: userId, role: "facility_admin" }, { onConflict: "user_id" });

    if (roleError) {
      return NextResponse.json(
        {
          error: "Signup succeeded but role assignment failed",
          details: roleError.message,
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({
    user: data.user,
    session: data.session,
    role,
  });
}
