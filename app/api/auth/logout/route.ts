import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { LogoutSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const parsed = LogoutSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid logout payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: parsed.data.scope });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
