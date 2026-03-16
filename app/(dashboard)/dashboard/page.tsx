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

async function getDashboardStats(role: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { assignments: 0, applications: 0, shifts: 0, messages: 0, upcomingShifts: [] };

  const today = new Date().toISOString().split("T")[0];

  if (role === "facility_admin") {
    const [assignmentsRes, applicationsRes, shiftsRes, messagesRes, upcomingRes] = await Promise.all([
      supabase.from("assignments").select("*", { count: "exact", head: true })
        .in("assignment_status", ["assigned", "in_progress"]),
      supabase.from("applications").select("*", { count: "exact", head: true })
        .eq("application_status", "applied"),
      supabase.from("shifts").select("*", { count: "exact", head: true })
        .eq("status", "open"),
      supabase.from("conversations").select("*", { count: "exact", head: true }),
      supabase.from("shifts").select("id, title, shift_date, start_time, end_time")
        .gte("shift_date", today)
        .order("shift_date", { ascending: true })
        .limit(3),
    ]);

    return {
      assignments: assignmentsRes.count ?? 0,
      applications: applicationsRes.count ?? 0,
      shifts: shiftsRes.count ?? 0,
      messages: messagesRes.count ?? 0,
      upcomingShifts: upcomingRes.data ?? [],
    };
  }

  // healthcare_worker (default)
  const [assignmentsRes, applicationsRes, shiftsRes, messagesRes, upcomingRes] = await Promise.all([
    supabase.from("assignments").select("*", { count: "exact", head: true })
      .eq("worker_id", user.id)
      .in("assignment_status", ["assigned", "in_progress"]),
    supabase.from("applications").select("*", { count: "exact", head: true })
      .eq("worker_id", user.id)
      .eq("application_status", "applied"),
    supabase.from("assignments").select("shift_id", { count: "exact", head: true })
      .eq("worker_id", user.id)
      .in("assignment_status", ["assigned", "in_progress"]),
    supabase.from("conversations").select("*", { count: "exact", head: true }),
    supabase.from("assignments").select("id, shift_id, shifts(title, shift_date, start_time, end_time)")
      .eq("worker_id", user.id)
      .in("assignment_status", ["assigned", "in_progress"])
      .limit(3),
  ]);

  return {
    assignments: assignmentsRes.count ?? 0,
    applications: applicationsRes.count ?? 0,
    shifts: shiftsRes.count ?? 0,
    messages: messagesRes.count ?? 0,
    upcomingShifts: upcomingRes.data ?? [],
  };
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = (user?.user_metadata?.role as string) ?? "healthcare_worker";
  const stats = await getDashboardStats(role);

  const statCards = [
    { label: "Active Assignments", icon: ClipboardList, value: stats.assignments },
    { label: "Pending Applications", icon: FileText, value: stats.applications },
    { label: "Upcoming Shifts", icon: Calendar, value: stats.shifts },
    { label: "Messages", icon: MessageSquare, value: stats.messages },
  ];

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
            {stats.upcomingShifts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {role === "facility_admin"
                  ? "No upcoming shifts posted."
                  : "No upcoming assigned shifts."}
              </p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingShifts.map((shift: Record<string, unknown>, i: number) => {
                  const title = (shift.title as string) ?? (shift.shifts as Record<string, unknown>)?.title ?? "Shift";
                  const date = (shift.shift_date as string) ?? (shift.shifts as Record<string, unknown>)?.shift_date ?? "";
                  const start = (shift.start_time as string) ?? (shift.shifts as Record<string, unknown>)?.start_time ?? "";
                  const end = (shift.end_time as string) ?? (shift.shifts as Record<string, unknown>)?.end_time ?? "";
                  return (
                    <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <span className="text-sm font-medium">{title}</span>
                      <span className="text-xs text-muted-foreground">{date} {start}–{end}</span>
                    </div>
                  );
                })}
              </div>
            )}
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
