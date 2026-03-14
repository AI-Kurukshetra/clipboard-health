"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";

type ApplicationRecord = {
  id: string;
  shift_id: string;
  worker_id: string;
  application_status: "applied" | "accepted" | "rejected" | "cancelled";
  applied_at: string;
};

type ApplicationResponse = {
  data: ApplicationRecord[];
  error?: string;
};

async function fetchMyApplications(): Promise<ApplicationRecord[]> {
  const response = await fetch("/api/applications/my");
  const payload = (await response.json()) as ApplicationResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load applications");
  }

  return payload.data;
}

async function fetchFacilityApplications(shiftId: string): Promise<ApplicationRecord[]> {
  const response = await fetch(`/api/applications?scope=facility&shift_id=${shiftId}`);
  const payload = (await response.json()) as ApplicationResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load facility applications");
  }

  return payload.data;
}

async function applyToShift(shiftId: string): Promise<void> {
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ shift_id: shiftId }),
  });

  const payload = (await response.json()) as ApplicationResponse;
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to apply");
  }
}

async function updateStatus(applicationId: string, status: ApplicationRecord["application_status"]): Promise<void> {
  const response = await fetch("/api/applications", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ application_id: applicationId, application_status: status }),
  });

  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to update application");
  }
}

export function ApplicationsWorkspace() {
  const [shiftId, setShiftId] = useState("");
  const [facilityShiftId, setFacilityShiftId] = useState("");

  const myApplicationsQuery = useQuery({
    queryKey: ["my-applications"],
    queryFn: fetchMyApplications,
  });

  const facilityApplicationsQuery = useQuery({
    queryKey: ["facility-applications", facilityShiftId],
    queryFn: () => fetchFacilityApplications(facilityShiftId),
    enabled: facilityShiftId.length > 0,
  });

  const applyMutation = useMutation({
    mutationFn: applyToShift,
    onSuccess: async () => {
      await myApplicationsQuery.refetch();
      setShiftId("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ applicationId, status }: { applicationId: string; status: ApplicationRecord["application_status"] }) =>
      updateStatus(applicationId, status),
    onSuccess: async () => {
      await myApplicationsQuery.refetch();
      if (facilityShiftId) {
        await facilityApplicationsQuery.refetch();
      }
    },
  });

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">Apply to Shift</h1>
        <div className="mt-4 flex gap-3">
          <input
            value={shiftId}
            onChange={(event) => setShiftId(event.target.value)}
            placeholder="Shift ID"
            className="w-full rounded border px-3 py-2 text-sm"
          />
          <button
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            onClick={async () => {
              if (shiftId) {
                await applyMutation.mutateAsync(shiftId);
              }
            }}
            disabled={applyMutation.isPending}
          >
            Apply
          </button>
        </div>

        {applyMutation.isError && <p className="mt-3 text-sm text-red-600">Unable to apply for shift.</p>}
        {applyMutation.isSuccess && <p className="mt-3 text-sm text-green-700">Application submitted.</p>}

        <h2 className="mt-6 text-lg font-semibold text-slate-900">My Applications</h2>
        {myApplicationsQuery.isPending && <p className="mt-2 text-sm text-slate-500">Loading applications...</p>}
        {myApplicationsQuery.isError && <p className="mt-2 text-sm text-red-600">Unable to load applications.</p>}

        <div className="mt-3 space-y-3">
          {myApplicationsQuery.data?.map((application) => (
            <article key={application.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-900">Shift: {application.shift_id}</p>
              <p className="text-sm text-slate-600">Status: {application.application_status}</p>
              <button
                className="mt-2 rounded border border-slate-300 px-2 py-1 text-xs"
                onClick={async () => {
                  await updateMutation.mutateAsync({
                    applicationId: application.id,
                    status: "cancelled",
                  });
                }}
              >
                Cancel
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Facility Applicant Review</h2>
        <div className="mt-4 flex gap-3">
          <input
            value={facilityShiftId}
            onChange={(event) => setFacilityShiftId(event.target.value)}
            placeholder="Shift ID"
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>

        {facilityApplicationsQuery.isPending && facilityShiftId.length > 0 && (
          <p className="mt-3 text-sm text-slate-500">Loading applicants...</p>
        )}
        {facilityApplicationsQuery.isError && <p className="mt-3 text-sm text-red-600">Unable to load applicants.</p>}

        <div className="mt-3 space-y-3">
          {facilityApplicationsQuery.data?.map((application) => (
            <article key={application.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-900">Worker: {application.worker_id}</p>
              <p className="text-sm text-slate-600">Status: {application.application_status}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                  onClick={async () => {
                    await updateMutation.mutateAsync({
                      applicationId: application.id,
                      status: "accepted",
                    });
                  }}
                >
                  Accept
                </button>
                <button
                  className="rounded border border-slate-300 px-2 py-1 text-xs"
                  onClick={async () => {
                    await updateMutation.mutateAsync({
                      applicationId: application.id,
                      status: "rejected",
                    });
                  }}
                >
                  Reject
                </button>
              </div>
            </article>
          ))}
          {facilityShiftId && facilityApplicationsQuery.data?.length === 0 && (
            <p className="text-sm text-slate-500">No applicants yet.</p>
          )}
        </div>
      </section>
    </main>
  );
}
