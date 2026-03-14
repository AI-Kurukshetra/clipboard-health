"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

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

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load timesheets");
  }

  return payload.data;
}

async function fetchFacilityTimesheets(assignmentId: string): Promise<TimesheetRecord[]> {
  const response = await fetch(`/api/timesheets?scope=facility&assignment_id=${assignmentId}`);
  const payload = (await response.json()) as TimesheetResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load facility timesheets");
  }

  return payload.data;
}

async function clockAction(payload: { assignment_id: string; action: "clock_in" | "clock_out" }): Promise<void> {
  const response = await fetch("/api/timesheets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Clock action failed");
  }
}

export function TimesheetsWorkspace() {
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
      if (facilityAssignmentId) {
        await facilityTimesheetsQuery.refetch();
      }
    },
  });

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">Clock In / Out</h1>
        <div className="mt-4 grid gap-3">
          <input
            value={assignmentId}
            onChange={(event) => setAssignmentId(event.target.value)}
            placeholder="Assignment ID"
            className="rounded border px-3 py-2 text-sm"
          />
          <div className="flex gap-2">
            <button
              className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              onClick={async () => {
                if (assignmentId) {
                  await actionMutation.mutateAsync({
                    assignment_id: assignmentId,
                    action: "clock_in",
                  });
                }
              }}
            >
              Clock In
            </button>
            <button
              className="rounded border border-slate-300 px-3 py-2 text-sm"
              onClick={async () => {
                if (assignmentId) {
                  await actionMutation.mutateAsync({
                    assignment_id: assignmentId,
                    action: "clock_out",
                  });
                }
              }}
            >
              Clock Out
            </button>
          </div>
        </div>

        {actionMutation.isError && <p className="mt-3 text-sm text-red-600">Clock action failed.</p>}
        {actionMutation.isSuccess && <p className="mt-3 text-sm text-green-700">Timesheet updated.</p>}

        <h2 className="mt-6 text-lg font-semibold text-slate-900">My Timesheets</h2>
        {myTimesheetsQuery.isPending && <p className="mt-2 text-sm text-slate-500">Loading timesheets...</p>}
        {myTimesheetsQuery.isError && <p className="mt-2 text-sm text-red-600">Unable to load timesheets.</p>}

        <div className="mt-3 space-y-3">
          {myTimesheetsQuery.data?.map((timesheet) => (
            <article key={timesheet.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-900">Assignment: {timesheet.assignment_id}</p>
              <p className="text-sm text-slate-600">Clock in: {timesheet.clock_in_time ?? "-"}</p>
              <p className="text-sm text-slate-600">Clock out: {timesheet.clock_out_time ?? "-"}</p>
              <p className="text-sm text-slate-700">Hours: {timesheet.hours_worked ?? 0}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Facility Timesheet Visibility</h2>
        <input
          value={facilityAssignmentId}
          onChange={(event) => setFacilityAssignmentId(event.target.value)}
          placeholder="Assignment ID"
          className="mt-4 w-full rounded border px-3 py-2 text-sm"
        />

        {facilityTimesheetsQuery.isPending && facilityAssignmentId && (
          <p className="mt-3 text-sm text-slate-500">Loading facility timesheets...</p>
        )}
        {facilityTimesheetsQuery.isError && (
          <p className="mt-3 text-sm text-red-600">Unable to load facility timesheets.</p>
        )}

        <div className="mt-3 space-y-3">
          {facilityTimesheetsQuery.data?.map((timesheet) => (
            <article key={timesheet.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-900">Assignment: {timesheet.assignment_id}</p>
              <p className="text-sm text-slate-600">Clock in: {timesheet.clock_in_time ?? "-"}</p>
              <p className="text-sm text-slate-600">Clock out: {timesheet.clock_out_time ?? "-"}</p>
              <p className="text-sm text-slate-700">Hours: {timesheet.hours_worked ?? 0}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
