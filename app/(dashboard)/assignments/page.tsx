import type { Metadata } from "next";

import { AssignmentsWorkspace } from "@/components/assignments/assignments-workspace";

export const metadata: Metadata = {
  title: "Assignments",
  description: "Assign workers and track assignment status",
};

export default function AssignmentsPage() {
  return <AssignmentsWorkspace />;
}
