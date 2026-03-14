"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";

import {
  AvailabilityPayloadSchema,
  type AvailabilityPayloadInput,
  type AvailabilitySlotInput,
} from "@/lib/validations/availability";

type AvailabilityResponse = {
  data: AvailabilitySlotInput[];
  error?: string;
};

const defaultSlot: AvailabilitySlotInput = {
  day_of_week: 1,
  start_time: "08:00",
  end_time: "16:00",
  preference_note: "",
};

async function fetchAvailability(): Promise<AvailabilitySlotInput[]> {
  const response = await fetch("/api/availability");
  const payload = (await response.json()) as AvailabilityResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load availability");
  }

  return payload.data ?? [];
}

async function saveAvailability(values: AvailabilityPayloadInput): Promise<void> {
  const response = await fetch("/api/availability", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const payload = (await response.json()) as AvailabilityResponse;
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to save availability");
  }
}

export function AvailabilityForm() {
  const form = useForm<AvailabilityPayloadInput>({
    resolver: zodResolver(AvailabilityPayloadSchema),
    defaultValues: {
      slots: [defaultSlot],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: "slots",
  });

  const query = useQuery({
    queryKey: ["availability"],
    queryFn: fetchAvailability,
  });

  useEffect(() => {
    if (query.data) {
      form.reset({
        slots: query.data.length > 0 ? query.data : [defaultSlot],
      });
    }
  }, [form, query.data]);

  const mutation = useMutation({
    mutationFn: saveAvailability,
  });

  return (
    <section className="mx-auto mt-8 w-full max-w-4xl rounded-xl border border-slate-200 bg-white p-6">
      <h1 className="text-xl font-semibold text-slate-900">Availability</h1>
      <p className="mt-1 text-sm text-slate-600">Set your preferred weekly working hours.</p>

      <form
        className="mt-6 space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
        })}
      >
        {fieldArray.fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-4">
            <select
              className="rounded border px-3 py-2 text-sm"
              {...form.register(`slots.${index}.day_of_week`, { valueAsNumber: true })}
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={2}>Tuesday</option>
              <option value={3}>Wednesday</option>
              <option value={4}>Thursday</option>
              <option value={5}>Friday</option>
              <option value={6}>Saturday</option>
            </select>
            <input type="time" className="rounded border px-3 py-2 text-sm" {...form.register(`slots.${index}.start_time`)} />
            <input type="time" className="rounded border px-3 py-2 text-sm" {...form.register(`slots.${index}.end_time`)} />
            <button
              type="button"
              onClick={() => fieldArray.remove(index)}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            >
              Remove
            </button>
            <input
              placeholder="Preference note"
              className="md:col-span-4 rounded border px-3 py-2 text-sm"
              {...form.register(`slots.${index}.preference_note`)}
            />
          </div>
        ))}

        {query.isPending && <p className="text-sm text-slate-500">Loading availability...</p>}
        {query.isError && <p className="text-sm text-red-600">Unable to load availability.</p>}
        {mutation.isError && <p className="text-sm text-red-600">Unable to save availability.</p>}
        {mutation.isSuccess && <p className="text-sm text-green-700">Availability saved.</p>}

        <div className="flex gap-3">
          <button
            type="button"
            className="rounded border border-slate-300 px-3 py-2 text-sm"
            onClick={() => fieldArray.append(defaultSlot)}
          >
            Add Slot
          </button>
          <button
            type="submit"
            className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save Availability"}
          </button>
        </div>
      </form>
    </section>
  );
}
