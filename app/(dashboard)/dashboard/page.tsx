import type { Metadata } from "next";
import {
  ClipboardList,
  FileText,
  Calendar,
  MessageSquare,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/page-header";

export const metadata: Metadata = {
  title: "Dashboard Home",
  description: "Authenticated dashboard landing page",
};

const statCards = [
  { label: "Active Assignments", icon: ClipboardList, value: "--" },
  { label: "Pending Applications", icon: FileText, value: "--" },
  { label: "Upcoming Shifts", icon: Calendar, value: "--" },
  { label: "Messages", icon: MessageSquare, value: "--" },
];

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.user_metadata?.role as string) ?? "healthcare_worker";

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user?.email ?? "user"}. Here's your overview.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Shifts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {role === "facility_admin"
                ? "Your posted shifts will appear here."
                : "Shifts you're assigned to will appear here."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Recent status changes and updates will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
