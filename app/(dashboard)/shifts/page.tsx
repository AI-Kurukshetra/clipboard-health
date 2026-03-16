import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { ShiftsWorkspace } from "@/components/shifts/shifts-workspace";

export const metadata: Metadata = {
  title: "Shifts",
  description: "Post and browse marketplace shifts",
};

export default async function ShiftsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as string) ?? "healthcare_worker";

  return <ShiftsWorkspace role={role} />;
}
