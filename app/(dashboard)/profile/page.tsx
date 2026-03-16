import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { FacilityProfileForm } from "@/components/profile/facility-profile-form";
import { WorkerProfileForm } from "@/components/profile/worker-profile-form";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile data",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = (user.user_metadata?.role as string) ?? "healthcare_worker";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description={
          role === "facility_admin"
            ? "Manage your facility profile"
            : "Manage your worker profile"
        }
      />
      <div className="max-w-2xl">
        {role === "facility_admin" ? (
          <FacilityProfileForm />
        ) : (
          <WorkerProfileForm />
        )}
      </div>
    </div>
  );
}
