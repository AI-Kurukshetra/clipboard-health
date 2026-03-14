"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  WorkerProfileSchema,
  type WorkerProfileInput,
} from "@/lib/validations/worker-profile";

type WorkerProfileResponse = {
  data: WorkerProfileInput | null;
  error?: string;
};

async function fetchWorkerProfile(): Promise<WorkerProfileInput | null> {
  const response = await fetch("/api/workers/me");
  const payload = (await response.json()) as WorkerProfileResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load worker profile");
  }

  return payload.data;
}

async function saveWorkerProfile(values: WorkerProfileInput): Promise<void> {
  const response = await fetch("/api/workers/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const payload = (await response.json()) as WorkerProfileResponse;
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to save worker profile");
  }
}

export function WorkerProfileForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkerProfileInput>({
    resolver: zodResolver(WorkerProfileSchema),
    defaultValues: {
      full_name: "",
      phone: "",
      location: "",
      specialty: "",
      years_experience: 0,
      bio: "",
    },
  });

  const query = useQuery({
    queryKey: ["worker-profile"],
    queryFn: fetchWorkerProfile,
  });

  useEffect(() => {
    if (query.data) {
      reset(query.data);
    }
  }, [query.data, reset]);

  const mutation = useMutation({
    mutationFn: saveWorkerProfile,
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Worker Profile</h2>
      <form
        className="mt-4 grid gap-4"
        onSubmit={handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
        })}
      >
        <input {...register("full_name")} placeholder="Full name" className="rounded border px-3 py-2 text-sm" />
        {errors.full_name && <p className="text-xs text-red-600">{errors.full_name.message}</p>}

        <input {...register("phone")} placeholder="Phone" className="rounded border px-3 py-2 text-sm" />
        <input {...register("location")} placeholder="Location" className="rounded border px-3 py-2 text-sm" />
        <input {...register("specialty")} placeholder="Specialty" className="rounded border px-3 py-2 text-sm" />
        <input
          type="number"
          {...register("years_experience", { valueAsNumber: true })}
          placeholder="Years of experience"
          className="rounded border px-3 py-2 text-sm"
        />
        <textarea {...register("bio")} placeholder="Bio" className="rounded border px-3 py-2 text-sm" />

        {query.isPending && <p className="text-sm text-slate-500">Loading profile...</p>}
        {query.isError && <p className="text-sm text-red-600">Unable to load worker profile.</p>}
        {mutation.isError && <p className="text-sm text-red-600">Unable to save worker profile.</p>}
        {mutation.isSuccess && <p className="text-sm text-green-700">Worker profile saved.</p>}

        <button
          type="submit"
          className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Worker Profile"}
        </button>
      </form>
    </section>
  );
}
