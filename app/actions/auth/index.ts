"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { LoginSchema, SignUpSchema } from "@/lib/validations/auth";

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const parsed = SignUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "healthcare_worker",
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid signup payload" };
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
    return { success: false, error: error.message };
  }

  const userId = data.user?.id;
  if (role === "facility_admin" && userId) {
    const adminClient = createAdminClient();
    const { error: roleError } = await adminClient
      .from("user_roles")
      .upsert({ user_id: userId, role: "facility_admin" }, { onConflict: "user_id" });

    if (roleError) {
      return { success: false, error: "Signup succeeded but role assignment failed" };
    }
  }

  return { success: true };
}

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { success: false, error: "Invalid login payload" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signOutAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
