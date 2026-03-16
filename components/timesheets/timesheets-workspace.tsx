"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Timer, Play, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";

type TimesheetRecord = {
  id: string;
  assignment_id: string;
  clock_in_time: string | null;
  clock_out_time: string | null;
  hours_worked: number | null;
};

type TimesheetResponse = {
  data: TimesheetRecord[];
  error?: string;
};

async function fetchMyTimesheets(): Promise<TimesheetRecord[]> {
  const response = await fetch("/api/timesheets/my");
  const payload = (await response.json()) as TimesheetResponse;
  if (!response.ok) throw new Error(payload.error ?? "Failed to load timesheets");
  return payload.data;
}

async function fetchFacilityTimesheets(assignmentId: string): Promise<TimesheetRecord[]> {
  const response = await fetch(`/api/timesheets?scope=facility&assignment_id=${assignmentId}`);
  const payload = (await response.json()) as TimesheetResponse;
  if (!response.ok) throw new Error(payload.error ?? "Failed to load facility timesheets");
  return payload.data;
}

async function clockAction(payload: { assignment_id: string; action: "clock_in" | "clock_out" }): Promise<void> {
  const response = await fetch("/api/timesheets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Clock action failed");
}

export function TimesheetsWorkspace({ role = "healthcare_worker" }: { role?: string }) {
  const [assignmentId, setAssignmentId] = useState("");
  const [facilityAssignmentId, setFacilityAssignmentId] = useState("");

  const myTimesheetsQuery = useQuery({
    queryKey: ["my-timesheets"],
    queryFn: fetchMyTimesheets,
  });

  const facilityTimesheetsQuery = useQuery({
    queryKey: ["facility-timesheets", facilityAssignmentId],
    queryFn: () => fetchFacilityTimesheets(facilityAssignmentId),
    enabled: facilityAssignmentId.length > 0,
  });

  const actionMutation = useMutation({
    mutationFn: clockAction,
    onSuccess: async () => {
      await myTimesheetsQuery.refetch();
      if (facilityAssignmentId) await facilityTimesheetsQuery.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Time Tracking" description="Clock in/out and view worked hours" />

      {role !== "facility_admin" && <Card>
        <CardHeader>
          <CardTitle className="text-base">Clock In / Out</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Assignment ID</Label>
            <Input
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              className="max-w-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="lg"
              onClick={async () => {
                if (assignmentId) {
                  await actionMutation.mutateAsync({ assignment_id: assignmentId, action: "clock_in" });
                }
              }}
              disabled={actionMutation.isPending || !assignmentId}
            >
              <Play className="h-4 w-4" />
              Clock In
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={async () => {
                if (assignmentId) {
                  await actionMutation.mutateAsync({ assignment_id: assignmentId, action: "clock_out" });
                }
              }}
              disabled={actionMutation.isPending || !assignmentId}
            >
              <Square className="h-4 w-4" />
              Clock Out
            </Button>
          </div>
          {actionMutation.isError && <Alert variant="destructive"><AlertDescription>Clock action failed.</AlertDescription></Alert>}
          {actionMutation.isSuccess && <Alert><AlertDescription>Timesheet updated.</AlertDescription></Alert>}
        </CardContent>
      </Card>}

      <Tabs defaultValue={role === "facility_admin" ? "facility" : "my-timesheets"}>
        <TabsList>
          {(role === "healthcare_worker" || role === "admin") && (
            <TabsTrigger value="my-timesheets">My Timesheets</TabsTrigger>
          )}
          {(role === "facility_admin" || role === "admin") && (
            <TabsTrigger value="facility">Facility View</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-timesheets">
          <Card>
            <CardContent className="pt-6">
              {myTimesheetsQuery.isPending && <TableSkeleton />}
              {myTimesheetsQuery.isError && <Alert variant="destructive"><AlertDescription>Unable to load timesheets.</AlertDescription></Alert>}

              {myTimesheetsQuery.data && myTimesheetsQuery.data.length === 0 && (
                <EmptyState icon={Timer} title="No timesheets" description="You don't have any timesheet records yet." />
              )}

              {myTimesheetsQuery.data && myTimesheetsQuery.data.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myTimesheetsQuery.data.map((ts) => (
                      <TableRow key={ts.id}>
                        <TableCell className="font-medium">{ts.assignment_id}</TableCell>
                        <TableCell>{ts.clock_in_time ?? "-"}</TableCell>
                        <TableCell>{ts.clock_out_time ?? "-"}</TableCell>
                        <TableCell>{ts.hours_worked ?? 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Facility Timesheet Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={facilityAssignmentId}
                onChange={(e) => setFacilityAssignmentId(e.target.value)}
                placeholder="Enter Assignment ID"
                className="max-w-xs"
              />
            </CardContent>
          </Card>

          {facilityTimesheetsQuery.isPending && facilityAssignmentId && <TableSkeleton rows={3} />}
          {facilityTimesheetsQuery.isError && <Alert variant="destructive"><AlertDescription>Unable to load facility timesheets.</AlertDescription></Alert>}

          {facilityTimesheetsQuery.data && facilityTimesheetsQuery.data.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Assignment</TableHead>
                      <TableHead>Clock In</TableHead>
                      <TableHead>Clock Out</TableHead>
                      <TableHead>Hours</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facilityTimesheetsQuery.data.map((ts) => (
                      <TableRow key={ts.id}>
                        <TableCell className="font-medium">{ts.assignment_id}</TableCell>
                        <TableCell>{ts.clock_in_time ?? "-"}</TableCell>
                        <TableCell>{ts.clock_out_time ?? "-"}</TableCell>
                        <TableCell>{ts.hours_worked ?? 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
