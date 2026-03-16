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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type CurrentRole = "healthcare_worker" | "facility_admin" | "admin";

type CurrentRoleResponse = {
  data?: {
    role?: CurrentRole;
  };
  error?: string;
};

async function fetchWorkerProfile(): Promise<WorkerProfileInput | null> {
  const response = await fetch("/api/workers/me");
  const payload = (await response.json()) as { data: WorkerProfileInput | null; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load worker profile");
  }

  return payload.data;
}

async function saveWorkerProfile(values: WorkerProfileInput): Promise<void> {
  const response = await fetch("/api/workers/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const payload = (await response.json()) as { error?: string };
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
    <Card>
      <CardHeader>
        <CardTitle>Worker Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
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
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && <p className="text-[0.8rem] font-medium text-destructive">{errors.full_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Specialty</Label>
            <Input id="specialty" {...register("specialty")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="years_experience">Years of experience</Label>
            <Input id="years_experience" type="number" {...register("years_experience", { valueAsNumber: true })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" {...register("bio")} />
          </div>

          {query.isPending && <p className="text-sm text-muted-foreground">Loading profile...</p>}
          {query.isError && <Alert variant="destructive"><AlertDescription>Unable to load worker profile.</AlertDescription></Alert>}
          {roleQuery.isError && <Alert variant="destructive"><AlertDescription>Unable to load account role.</AlertDescription></Alert>}
          {mutation.isError && <Alert variant="destructive"><AlertDescription>Unable to save worker profile.</AlertDescription></Alert>}
          {mutation.isSuccess && <Alert><AlertDescription>Worker profile saved.</AlertDescription></Alert>}
          {redirectError && <Alert><AlertDescription>{redirectError}</AlertDescription></Alert>}

          <Button type="submit" disabled={mutation.isPending || roleQuery.isPending}>
            {mutation.isPending ? "Saving..." : "Save Worker Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
