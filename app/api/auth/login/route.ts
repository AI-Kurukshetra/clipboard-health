import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { LoginSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = LoginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid login payload",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { error, data } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  return NextResponse.json({ user: data.user, session: data.session });
}
