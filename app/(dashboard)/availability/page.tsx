import type { Metadata } from "next";

import { AvailabilityForm } from "@/components/availability/availability-form";

export const metadata: Metadata = {
  title: "Availability",
  description: "Manage worker availability preferences",
};

export default function AvailabilityPage() {
  return <AvailabilityForm />;
}
