"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

type AssignmentRecord = {
  id: string;
  shift_id: string;
  worker_id: string;
  assignment_status: "assigned" | "in_progress" | "completed" | "cancelled";
  assigned_at: string;
};

type AssignmentResponse = {
  data: AssignmentRecord[];
  error?: string;
};

async function fetchMyAssignments(): Promise<AssignmentRecord[]> {
  const response = await fetch("/api/assignments/my");
  const payload = (await response.json()) as AssignmentResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load assignments");
  }

  return payload.data;
}

async function fetchFacilityAssignments(shiftId: string): Promise<AssignmentRecord[]> {
  const response = await fetch(`/api/assignments?scope=facility&shift_id=${shiftId}`);
  const payload = (await response.json()) as AssignmentResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load facility assignments");
  }

  return payload.data;
}

async function createAssignment(payload: {
  shift_id: string;
  worker_id: string;
  application_id?: string;
}): Promise<void> {
  const response = await fetch("/api/assignments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Failed to create assignment");
  }
}

async function updateAssignmentStatus(payload: {
  assignment_id: string;
  assignment_status: AssignmentRecord["assignment_status"];
}): Promise<void> {
  const response = await fetch("/api/assignments", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Failed to update assignment");
  }
}

export function AssignmentsWorkspace() {
  const [shiftId, setShiftId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [facilityShiftId, setFacilityShiftId] = useState("");

  const myQuery = useQuery({
    queryKey: ["my-assignments"],
    queryFn: fetchMyAssignments,
  });

  const facilityQuery = useQuery({
    queryKey: ["facility-assignments", facilityShiftId],
    queryFn: () => fetchFacilityAssignments(facilityShiftId),
    enabled: facilityShiftId.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: createAssignment,
    onSuccess: async () => {
      setShiftId("");
      setWorkerId("");
      setApplicationId("");
      await myQuery.refetch();
      if (facilityShiftId) {
        await facilityQuery.refetch();
      }
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAssignmentStatus,
    onSuccess: async () => {
      await myQuery.refetch();
      if (facilityShiftId) {
        await facilityQuery.refetch();
      }
    },
  });

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">Create Assignment</h1>
        <div className="mt-4 grid gap-3">
          <input
            value={shiftId}
            onChange={(event) => setShiftId(event.target.value)}
            placeholder="Shift ID"
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            value={workerId}
            onChange={(event) => setWorkerId(event.target.value)}
            placeholder="Worker ID"
            className="rounded border px-3 py-2 text-sm"
          />
          <input
            value={applicationId}
            onChange={(event) => setApplicationId(event.target.value)}
            placeholder="Application ID (optional)"
            className="rounded border px-3 py-2 text-sm"
          />
          <button
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={async () => {
              if (!shiftId || !workerId) {
                return;
              }

              await createMutation.mutateAsync({
                shift_id: shiftId,
                worker_id: workerId,
                application_id: applicationId || undefined,
              });
            }}
          >
            Assign Worker
          </button>
        </div>
        {createMutation.isError && <p className="mt-3 text-sm text-red-600">Unable to create assignment.</p>}
        {createMutation.isSuccess && <p className="mt-3 text-sm text-green-700">Assignment created.</p>}

        <h2 className="mt-6 text-lg font-semibold text-slate-900">My Assignments</h2>
        {myQuery.isPending && <p className="mt-2 text-sm text-slate-500">Loading assignments...</p>}
        {myQuery.isError && <p className="mt-2 text-sm text-red-600">Unable to load assignments.</p>}
        <div className="mt-3 space-y-3">
          {myQuery.data?.map((assignment) => (
            <article key={assignment.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-900">Shift: {assignment.shift_id}</p>
              <p className="text-sm text-slate-600">Status: {assignment.assignment_status}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Manage Assignments</h2>
        <input
          value={facilityShiftId}
          onChange={(event) => setFacilityShiftId(event.target.value)}
          placeholder="Shift ID"
          className="mt-4 w-full rounded border px-3 py-2 text-sm"
        />

        {facilityQuery.isPending && facilityShiftId && <p className="mt-3 text-sm text-slate-500">Loading shift assignments...</p>}
        {facilityQuery.isError && <p className="mt-3 text-sm text-red-600">Unable to load shift assignments.</p>}

        <div className="mt-3 space-y-3">
          {facilityQuery.data?.map((assignment) => (
            <article key={assignment.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-900">Worker: {assignment.worker_id}</p>
              <p className="text-sm text-slate-600">Status: {assignment.assignment_status}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                  onClick={async () => {
                    await updateMutation.mutateAsync({
                      assignment_id: assignment.id,
                      assignment_status: "in_progress",
                    });
                  }}
                >
                  Start
                </button>
                <button
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                  onClick={async () => {
                    await updateMutation.mutateAsync({
                      assignment_id: assignment.id,
                      assignment_status: "completed",
                    });
                  }}
                >
                  Complete
                </button>
                <button
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                  onClick={async () => {
                    await updateMutation.mutateAsync({
                      assignment_id: assignment.id,
                      assignment_status: "cancelled",
                    });
                  }}
                >
                  Cancel
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
