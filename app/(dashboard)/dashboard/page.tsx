import type { Metadata } from "next";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard Home",
  description: "Authenticated dashboard landing page",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-2 text-sm text-slate-600">Welcome {user?.email ?? "user"}.</p>
    </main>
  );
}
