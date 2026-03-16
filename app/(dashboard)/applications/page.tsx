import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { ApplicationsWorkspace } from "@/components/applications/applications-workspace";

export const metadata: Metadata = {
  title: "Applications",
  description: "Apply to shifts and review applicants",
};

export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as string) ?? "healthcare_worker";

  return <ApplicationsWorkspace role={role} />;
}
