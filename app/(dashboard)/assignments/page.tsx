import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";
import { AssignmentsWorkspace } from "@/components/assignments/assignments-workspace";

export const metadata: Metadata = {
  title: "Assignments",
  description: "Assign workers and track assignment status",
};

export default async function AssignmentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = (user?.user_metadata?.role as string) ?? "healthcare_worker";

  return <AssignmentsWorkspace role={role} />;
}
