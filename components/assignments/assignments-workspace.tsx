"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ClipboardList, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/ui/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";

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
  if (!response.ok) throw new Error(payload.error ?? "Failed to load assignments");
  return payload.data;
}

async function fetchFacilityAssignments(shiftId: string): Promise<AssignmentRecord[]> {
  const response = await fetch(`/api/assignments?scope=facility&shift_id=${shiftId}`);
  const payload = (await response.json()) as AssignmentResponse;
  if (!response.ok) throw new Error(payload.error ?? "Failed to load facility assignments");
  return payload.data;
}

async function createAssignment(payload: {
  shift_id: string;
  worker_id: string;
  application_id?: string;
}): Promise<void> {
  const response = await fetch("/api/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Failed to create assignment");
}

async function updateAssignmentStatus(payload: {
  assignment_id: string;
  assignment_status: AssignmentRecord["assignment_status"];
}): Promise<void> {
  const response = await fetch("/api/assignments", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Failed to update assignment");
}

export function AssignmentsWorkspace() {
  const [shiftId, setShiftId] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [facilityShiftId, setFacilityShiftId] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
      setDialogOpen(false);
      await myQuery.refetch();
      if (facilityShiftId) await facilityQuery.refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAssignmentStatus,
    onSuccess: async () => {
      await myQuery.refetch();
      if (facilityShiftId) await facilityQuery.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Manage worker assignments"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Create Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Assignment</DialogTitle>
                <DialogDescription>Assign a worker to a shift.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Shift ID</Label>
                  <Input value={shiftId} onChange={(e) => setShiftId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Worker ID</Label>
                  <Input value={workerId} onChange={(e) => setWorkerId(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Application ID (optional)</Label>
                  <Input value={applicationId} onChange={(e) => setApplicationId(e.target.value)} />
                </div>
                {createMutation.isError && <Alert variant="destructive"><AlertDescription>Unable to create assignment.</AlertDescription></Alert>}
                <Button
                  className="w-full"
                  onClick={async () => {
                    if (!shiftId || !workerId) return;
                    await createMutation.mutateAsync({
                      shift_id: shiftId,
                      worker_id: workerId,
                      application_id: applicationId || undefined,
                    });
                  }}
                  disabled={createMutation.isPending}
                >
                  Assign Worker
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <Tabs defaultValue="my-assignments">
        <TabsList>
          <TabsTrigger value="my-assignments">My Assignments</TabsTrigger>
          <TabsTrigger value="manage">Manage Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="my-assignments">
          <Card>
            <CardContent className="pt-6">
              {myQuery.isPending && <TableSkeleton />}
              {myQuery.isError && <Alert variant="destructive"><AlertDescription>Unable to load assignments.</AlertDescription></Alert>}

              {myQuery.data && myQuery.data.length === 0 && (
                <EmptyState icon={ClipboardList} title="No assignments" description="You don't have any assignments yet." />
              )}

              {myQuery.data && myQuery.data.length > 0 && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Shift</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myQuery.data.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.shift_id}</TableCell>
                        <TableCell><StatusBadge status={a.assignment_status} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Lookup by Shift</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={facilityShiftId}
                onChange={(e) => setFacilityShiftId(e.target.value)}
                placeholder="Enter Shift ID"
                className="max-w-xs"
              />
            </CardContent>
          </Card>

          {facilityQuery.isPending && facilityShiftId && <TableSkeleton rows={3} />}
          {facilityQuery.isError && <Alert variant="destructive"><AlertDescription>Unable to load shift assignments.</AlertDescription></Alert>}

          {facilityQuery.data && facilityQuery.data.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Worker</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {facilityQuery.data.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="font-medium">{a.worker_id}</TableCell>
                        <TableCell><StatusBadge status={a.assignment_status} /></TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm">Update</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem onClick={async () => {
                                await updateMutation.mutateAsync({ assignment_id: a.id, assignment_status: "in_progress" });
                              }}>
                                Start
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                await updateMutation.mutateAsync({ assignment_id: a.id, assignment_status: "completed" });
                              }}>
                                Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={async () => {
                                await updateMutation.mutateAsync({ assignment_id: a.id, assignment_status: "cancelled" });
                              }}>
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
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
