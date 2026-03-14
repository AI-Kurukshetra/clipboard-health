"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { ShiftCreateSchema, type ShiftCreateInput } from "@/lib/validations/shifts";

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
    headers: {
      "Content-Type": "application/json",
    },
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
      await query.refetch();
    },
  });

  return (
    <main className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 lg:grid-cols-2">
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-xl font-semibold text-slate-900">Post Shift</h1>
        <form
          className="mt-4 grid gap-3"
          onSubmit={form.handleSubmit(async (values) => {
            await mutation.mutateAsync(values);
          })}
        >
          <input placeholder="Facility ID" className="rounded border px-3 py-2 text-sm" {...form.register("facility_id")} />
          <input placeholder="Title" className="rounded border px-3 py-2 text-sm" {...form.register("title")} />
          <input placeholder="Department" className="rounded border px-3 py-2 text-sm" {...form.register("department")} />
          <input placeholder="Specialty" className="rounded border px-3 py-2 text-sm" {...form.register("specialty_required")} />
          <input type="date" className="rounded border px-3 py-2 text-sm" {...form.register("shift_date")} />
          <div className="grid grid-cols-2 gap-3">
            <input type="time" className="rounded border px-3 py-2 text-sm" {...form.register("start_time")} />
            <input type="time" className="rounded border px-3 py-2 text-sm" {...form.register("end_time")} />
          </div>
          <input
            type="number"
            step="0.01"
            className="rounded border px-3 py-2 text-sm"
            {...form.register("hourly_rate", { valueAsNumber: true })}
          />
          <input
            type="number"
            className="rounded border px-3 py-2 text-sm"
            {...form.register("workers_needed", { valueAsNumber: true })}
          />
          <input placeholder="Location" className="rounded border px-3 py-2 text-sm" {...form.register("location")} />
          <textarea placeholder="Description" className="rounded border px-3 py-2 text-sm" {...form.register("description")} />
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("urgent_flag")} />
            Mark as urgent
          </label>

          {mutation.isError && <p className="text-sm text-red-600">Unable to create shift.</p>}
          {mutation.isSuccess && <p className="text-sm text-green-700">Shift created.</p>}

          <button
            type="submit"
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Posting..." : "Post Shift"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">Browse Shifts</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={specialtyFilter}
            onChange={(event) => setSpecialtyFilter(event.target.value)}
            placeholder="Filter by specialty"
            className="rounded border px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={urgentOnly}
              onChange={(event) => setUrgentOnly(event.target.checked)}
            />
            Urgent only
          </label>
        </div>

        {query.isPending && <p className="mt-4 text-sm text-slate-500">Loading shifts...</p>}
        {query.isError && <p className="mt-4 text-sm text-red-600">Unable to load shifts.</p>}

        <div className="mt-4 space-y-3">
          {query.data?.map((shift) => (
            <article key={shift.id} className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-base font-semibold text-slate-900">{shift.title}</h3>
              <p className="text-sm text-slate-600">
                {shift.shift_date} {shift.start_time} - {shift.end_time}
              </p>
              <p className="text-sm text-slate-700">${shift.hourly_rate}/hr</p>
            </article>
          ))}
          {query.data && query.data.length === 0 && (
            <p className="text-sm text-slate-500">No shifts found for the selected filters.</p>
          )}
        </div>
      </section>
    </main>
  );
}
