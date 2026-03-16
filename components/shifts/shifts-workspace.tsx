"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Search, AlertTriangle } from "lucide-react";

import { ShiftCreateSchema, type ShiftCreateInput } from "@/lib/validations/shifts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { StatusBadge } from "@/components/ui/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/layout/page-header";

type ShiftRecord = ShiftCreateInput & {
  id: string;
  status: string;
  created_at: string;
};

type ShiftListResponse = {
  data: ShiftRecord[];
  error?: string;
};

const shiftDefaults: ShiftCreateInput = {
  facility_id: "",
  title: "",
  department: "",
  specialty_required: "",
  shift_date: "",
  start_time: "08:00",
  end_time: "16:00",
  hourly_rate: 40,
  workers_needed: 1,
  location: "",
  description: "",
  urgent_flag: false,
};

async function fetchShifts(filters: { specialty: string; urgent: boolean }): Promise<ShiftRecord[]> {
  const params = new URLSearchParams();
  if (filters.specialty) {
    params.set("specialty", filters.specialty);
  }
  if (filters.urgent) {
    params.set("urgent", "true");
  }
  params.set("sort", "newest");

  const response = await fetch(`/api/shifts?${params.toString()}`);
  const payload = (await response.json()) as ShiftListResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to load shifts");
  }

  return payload.data;
}

async function createShift(values: ShiftCreateInput): Promise<void> {
  const response = await fetch("/api/shifts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const payload = (await response.json()) as ShiftListResponse;
  if (!response.ok) {
    throw new Error(payload.error ?? "Unable to create shift");
  }
}

export function ShiftsWorkspace() {
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<ShiftCreateInput>({
    resolver: zodResolver(ShiftCreateSchema),
    defaultValues: shiftDefaults,
  });

  const query = useQuery({
    queryKey: ["shifts", specialtyFilter, urgentOnly],
    queryFn: () => fetchShifts({ specialty: specialtyFilter, urgent: urgentOnly }),
  });

  const mutation = useMutation({
    mutationFn: createShift,
    onSuccess: async () => {
      form.reset(shiftDefaults);
      setDialogOpen(false);
      await query.refetch();
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shifts"
        description="Browse and manage marketplace shifts"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Post Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Post a New Shift</DialogTitle>
                <DialogDescription>Fill in the details for your shift posting.</DialogDescription>
              </DialogHeader>
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(async (values) => {
                  await mutation.mutateAsync(values);
                })}
              >
                <div className="space-y-2">
                  <Label>Facility ID</Label>
                  <Input {...form.register("facility_id")} />
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input {...form.register("title")} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input {...form.register("department")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Specialty</Label>
                    <Input {...form.register("specialty_required")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" {...form.register("shift_date")} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" {...form.register("start_time")} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" {...form.register("end_time")} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Hourly Rate ($)</Label>
                    <Input type="number" step="0.01" {...form.register("hourly_rate", { valueAsNumber: true })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Workers Needed</Label>
                    <Input type="number" {...form.register("workers_needed", { valueAsNumber: true })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input {...form.register("location")} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea {...form.register("description")} />
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="urgent"
                    checked={form.watch("urgent_flag")}
                    onCheckedChange={(checked) => form.setValue("urgent_flag", checked === true)}
                  />
                  <Label htmlFor="urgent" className="cursor-pointer">Mark as urgent</Label>
                </div>

                {mutation.isError && <Alert variant="destructive"><AlertDescription>Unable to create shift.</AlertDescription></Alert>}

                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Posting..." : "Post Shift"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Browse Shifts</CardTitle>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                placeholder="Filter by specialty"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="urgentFilter"
                checked={urgentOnly}
                onCheckedChange={(checked) => setUrgentOnly(checked === true)}
              />
              <Label htmlFor="urgentFilter" className="cursor-pointer text-sm">Urgent only</Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {query.isPending && <TableSkeleton />}
          {query.isError && <Alert variant="destructive"><AlertDescription>Unable to load shifts.</AlertDescription></Alert>}

          {query.data && query.data.length === 0 && (
            <EmptyState
              icon={Search}
              title="No shifts found"
              description="No shifts match the selected filters."
            />
          )}

          {query.data && query.data.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {query.data.map((shift) => (
                  <TableRow key={shift.id}>
                    <TableCell className="font-medium">
                      {shift.title}
                      {shift.urgent_flag && (
                        <AlertTriangle className="ml-1 inline h-3 w-3 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>{shift.shift_date}</TableCell>
                    <TableCell>{shift.start_time} - {shift.end_time}</TableCell>
                    <TableCell>${shift.hourly_rate}/hr</TableCell>
                    <TableCell><StatusBadge status={shift.status ?? "open"} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
