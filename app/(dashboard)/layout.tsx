import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/auth/logout-button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Authenticated workspace",
};

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Healthcare Workforce Marketplace</p>
            <p className="text-xs text-slate-500">Signed in as {user.email ?? "user"}</p>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
