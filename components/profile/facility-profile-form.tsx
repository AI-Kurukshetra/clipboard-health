"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import {
  FacilityProfileSchema,
  type FacilityProfileInput,
} from "@/lib/validations/facility-profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

async function fetchFacilityProfile(): Promise<FacilityProfileInput | null> {
  const response = await fetch("/api/facilities/me");
  const payload = (await response.json()) as { data: FacilityProfileInput | null; error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to load facility profile");
  }

  return payload.data;
}

async function saveFacilityProfile(values: FacilityProfileInput): Promise<void> {
  const response = await fetch("/api/facilities/me", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  const payload = (await response.json()) as { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to save facility profile");
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

export function FacilityProfileForm() {
  const router = useRouter();
  const [redirectError, setRedirectError] = useState<string | null>(null);
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
    mutationFn: saveFacilityProfile,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facility Profile</CardTitle>
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
            <Label htmlFor="contact_name">Contact name</Label>
            <Input id="contact_name" {...register("contact_name")} />
            {errors.contact_name && <p className="text-[0.8rem] font-medium text-destructive">{errors.contact_name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="organization_name">Organization name</Label>
            <Input id="organization_name" {...register("organization_name")} />
          </div>

          {query.isPending && <p className="text-sm text-muted-foreground">Loading profile...</p>}
          {query.isError && <Alert variant="destructive"><AlertDescription>Unable to load facility profile.</AlertDescription></Alert>}
          {roleQuery.isError && <Alert variant="destructive"><AlertDescription>Unable to load account role.</AlertDescription></Alert>}
          {mutation.isError && <Alert variant="destructive"><AlertDescription>Unable to save facility profile.</AlertDescription></Alert>}
          {mutation.isSuccess && <Alert><AlertDescription>Facility profile saved.</AlertDescription></Alert>}
          {redirectError && <Alert><AlertDescription>{redirectError}</AlertDescription></Alert>}

          <Button type="submit" disabled={mutation.isPending || roleQuery.isPending}>
            {mutation.isPending ? "Saving..." : "Save Facility Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
