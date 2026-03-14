"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  FacilityProfileSchema,
  type FacilityProfileInput,
} from "@/lib/validations/facility-profile";

type FacilityProfileResponse = {
  data: FacilityProfileInput | null;
  error?: string;
};

async function fetchFacilityProfile(): Promise<FacilityProfileInput | null> {
  const response = await fetch("/api/facilities/me");
  const payload = (await response.json()) as FacilityProfileResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load facility profile");
  }

  return payload.data;
}

async function saveFacilityProfile(values: FacilityProfileInput): Promise<void> {
  const response = await fetch("/api/facilities/me", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });

  const payload = (await response.json()) as FacilityProfileResponse;
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to save facility profile");
  }
}

export function FacilityProfileForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FacilityProfileInput>({
    resolver: zodResolver(FacilityProfileSchema),
    defaultValues: {
      contact_name: "",
      phone: "",
      organization_name: "",
    },
  });

  const query = useQuery({
    queryKey: ["facility-profile"],
    queryFn: fetchFacilityProfile,
  });

  useEffect(() => {
    if (query.data) {
      reset(query.data);
    }
  }, [query.data, reset]);

  const mutation = useMutation({
    mutationFn: saveFacilityProfile,
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Facility Profile</h2>
      <form
        className="mt-4 grid gap-4"
        onSubmit={handleSubmit(async (values) => {
          await mutation.mutateAsync(values);
        })}
      >
        <input
          {...register("contact_name")}
          placeholder="Contact name"
          className="rounded border px-3 py-2 text-sm"
        />
        {errors.contact_name && <p className="text-xs text-red-600">{errors.contact_name.message}</p>}

        <input {...register("phone")} placeholder="Phone" className="rounded border px-3 py-2 text-sm" />
        <input
          {...register("organization_name")}
          placeholder="Organization name"
          className="rounded border px-3 py-2 text-sm"
        />

        {query.isPending && <p className="text-sm text-slate-500">Loading profile...</p>}
        {query.isError && <p className="text-sm text-red-600">Unable to load facility profile.</p>}
        {mutation.isError && <p className="text-sm text-red-600">Unable to save facility profile.</p>}
        {mutation.isSuccess && <p className="text-sm text-green-700">Facility profile saved.</p>}

        <button
          type="submit"
          className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Facility Profile"}
        </button>
      </form>
    </section>
  );
}
