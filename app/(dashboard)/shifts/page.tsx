import type { Metadata } from "next";

import { ShiftsWorkspace } from "@/components/shifts/shifts-workspace";

export const metadata: Metadata = {
  title: "Shifts",
  description: "Post and browse marketplace shifts",
};

export default function ShiftsPage() {
  return <ShiftsWorkspace />;
}
