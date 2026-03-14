import type { Metadata } from "next";

import { ApplicationsWorkspace } from "@/components/applications/applications-workspace";

export const metadata: Metadata = {
  title: "Applications",
  description: "Apply to shifts and review applicants",
};

export default function ApplicationsPage() {
  return <ApplicationsWorkspace />;
}
