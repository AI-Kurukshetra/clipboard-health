import type { Metadata } from "next";

import { TimesheetsWorkspace } from "@/components/timesheets/timesheets-workspace";

export const metadata: Metadata = {
  title: "Time Tracking",
  description: "Clock in/out and view worked hours",
};

export default function TimesheetsPage() {
  return <TimesheetsWorkspace />;
}
