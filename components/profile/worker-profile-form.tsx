"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  WorkerProfileSchema,
  type WorkerProfileInput,
} from "@/lib/validations/worker-profile";

type WorkerProfileResponse = {
  data: WorkerProfileInput | null;
  error?: string;
};

type CurrentRole = "healthcare_worker" | "facility_admin" | "admin";

type CurrentRoleResponse = {
  data?: {
    role?: CurrentRole;
  };
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

async function fetchCurrentRole(): Promise<CurrentRole> {
  const response = await fetch("/api/auth/me");
  const payload = (await response.json()) as CurrentRoleResponse;

  if (!response.ok || !payload.data?.role) {
    throw new Error(payload.error ?? "Failed to load current role");
  }

  return payload.data.role;
}

function getPostSavePath(role: CurrentRole): "/shifts" | "/applications" {
  if (role === "facility_admin" || role === "admin") {
    return "/applications";
  }

  return "/shifts";
}

export function WorkerProfileForm() {
  const router = useRouter();
  const [redirectError, setRedirectError] = useState<string | null>(null);
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

  const roleQuery = useQuery({
    queryKey: ["current-role"],
    queryFn: fetchCurrentRole,
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
          setRedirectError(null);
          await mutation.mutateAsync(values);

          try {
            const role = roleQuery.data ?? (await fetchCurrentRole());
            router.push(getPostSavePath(role));
            router.refresh();
          } catch {
            setRedirectError("Profile saved, but next-step routing failed. Please navigate manually.");
          }
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
        {roleQuery.isError && <p className="text-sm text-red-600">Unable to load account role.</p>}
        {mutation.isError && <p className="text-sm text-red-600">Unable to save worker profile.</p>}
        {mutation.isSuccess && <p className="text-sm text-green-700">Worker profile saved.</p>}
        {redirectError && <p className="text-sm text-amber-700">{redirectError}</p>}

        <button
          type="submit"
          className="rounded bg-slate-900 px-3 py-2 text-sm font-medium text-white"
          disabled={mutation.isPending || roleQuery.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save Worker Profile"}
        </button>
      </form>
    </section>
  );
}
