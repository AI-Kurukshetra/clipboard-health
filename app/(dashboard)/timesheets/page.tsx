import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { TimesheetsWorkspace } from "@/components/timesheets/timesheets-workspace";

export const metadata: Metadata = {
  title: "Time Tracking",
  description: "Clock in/out and view worked hours",
};

export default async function TimesheetsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as string) ?? "healthcare_worker";

  return <TimesheetsWorkspace role={role} />;
}
