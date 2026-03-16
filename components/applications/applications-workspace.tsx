"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FileText, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";

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
  if (!response.ok) throw new Error(payload.error ?? "Failed to load applications");
  return payload.data;
}

async function fetchFacilityApplications(shiftId: string): Promise<ApplicationRecord[]> {
  const response = await fetch(`/api/applications?scope=facility&shift_id=${shiftId}`);
  const payload = (await response.json()) as ApplicationResponse;
  if (!response.ok) throw new Error(payload.error ?? "Failed to load facility applications");
  return payload.data;
}

async function applyToShift(shiftId: string): Promise<void> {
  const response = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ shift_id: shiftId }),
  });
  const payload = (await response.json()) as ApplicationResponse;
  if (!response.ok) throw new Error(payload.error ?? "Failed to apply");
}

async function updateStatus(applicationId: string, status: ApplicationRecord["application_status"]): Promise<void> {
  const response = await fetch("/api/applications", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ application_id: applicationId, application_status: status }),
  });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Failed to update application");
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
      if (facilityShiftId) await facilityApplicationsQuery.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Applications" description="Apply to shifts and review applicants" />

      <Tabs defaultValue="my-applications">
        <TabsList>
          <TabsTrigger value="my-applications">My Applications</TabsTrigger>
          <TabsTrigger value="review">Review Applicants</TabsTrigger>
        </TabsList>

        <TabsContent value="my-applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Apply to Shift</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  value={shiftId}
                  onChange={(e) => setShiftId(e.target.value)}
                  placeholder="Enter Shift ID"
                  className="max-w-xs"
                />
                <Button
                  onClick={async () => {
                    if (shiftId) await applyMutation.mutateAsync(shiftId);
                  }}
                  disabled={applyMutation.isPending || !shiftId}
                >
                  <Send className="h-4 w-4" />
                  Apply
                </Button>
              </div>
              {applyMutation.isError && <Alert variant="destructive" className="mt-3"><AlertDescription>Unable to apply for shift.</AlertDescription></Alert>}
              {applyMutation.isSuccess && <Alert className="mt-3"><AlertDescription>Application submitted.</AlertDescription></Alert>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {myApplicationsQuery.isPending && <TableSkeleton />}
              {myApplicationsQuery.isError && <Alert variant="destructive"><AlertDescription>Unable to load applications.</AlertDescription></Alert>}

              {myApplicationsQuery.data && myApplicationsQuery.data.length === 0 && (
                <EmptyState icon={FileText} title="No applications" description="You haven't applied to any shifts yet." />
              )}

              {myApplicationsQuery.data && myApplicationsQuery.data.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shift</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myApplicationsQuery.data.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.shift_id}</TableCell>
                        <TableCell><StatusBadge status={app.application_status} /></TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              await updateMutation.mutateAsync({ applicationId: app.id, status: "cancelled" });
                            }}
                          >
                            Cancel
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Facility Applicant Review</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={facilityShiftId}
                onChange={(e) => setFacilityShiftId(e.target.value)}
                placeholder="Enter Shift ID to review applicants"
                className="max-w-xs"
              />

              {facilityApplicationsQuery.isPending && facilityShiftId.length > 0 && <TableSkeleton rows={3} />}
              {facilityApplicationsQuery.isError && <Alert variant="destructive" className="mt-3"><AlertDescription>Unable to load applicants.</AlertDescription></Alert>}

              {facilityShiftId && facilityApplicationsQuery.data?.length === 0 && (
                <EmptyState icon={FileText} title="No applicants" description="No applicants yet for this shift." />
              )}

              {facilityApplicationsQuery.data && facilityApplicationsQuery.data.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facilityApplicationsQuery.data.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.worker_id}</TableCell>
                        <TableCell><StatusBadge status={app.application_status} /></TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                await updateMutation.mutateAsync({ applicationId: app.id, status: "accepted" });
                              }}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                await updateMutation.mutateAsync({ applicationId: app.id, status: "rejected" });
                              }}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
