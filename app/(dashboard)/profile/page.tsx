import type { Metadata } from "next";

import { FacilityProfileForm } from "@/components/profile/facility-profile-form";
import { WorkerProfileForm } from "@/components/profile/worker-profile-form";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage worker and facility profile data",
};

export default function ProfilePage() {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-6 py-10 md:grid-cols-2">
      <WorkerProfileForm />
      <FacilityProfileForm />
    </main>
  );
}
