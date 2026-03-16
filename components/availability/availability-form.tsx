"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";

import {
  AvailabilityPayloadSchema,
  type AvailabilityPayloadInput,
  type AvailabilitySlotInput,
} from "@/lib/validations/availability";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/layout/page-header";

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

const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

async function fetchAvailability(): Promise<AvailabilitySlotInput[]> {
  const response = await fetch("/api/availability");
  const payload = (await response.json()) as AvailabilityResponse;
  if (!response.ok) throw new Error(payload.error ?? "Failed to load availability");
  return payload.data ?? [];
}

async function saveAvailability(values: AvailabilityPayloadInput): Promise<void> {
  const response = await fetch("/api/availability", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const payload = (await response.json()) as AvailabilityResponse;
  if (!response.ok) throw new Error(payload.error ?? "Failed to save availability");
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
    <div className="space-y-6">
      <PageHeader
        title="Availability"
        description="Set your preferred weekly working hours"
      />

      <Card>
        <CardContent className="pt-6">
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              await mutation.mutateAsync(values);
            })}
          >
            {fieldArray.fields.map((field, index) => (
              <Card key={field.id}>
                <CardContent className="grid gap-4 pt-6 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Day</Label>
                    <Select
                      value={String(form.watch(`slots.${index}.day_of_week`))}
                      onValueChange={(value) => form.setValue(`slots.${index}.day_of_week`, Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dayLabels.map((label, i) => (
                          <SelectItem key={i} value={String(i)}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input type="time" {...form.register(`slots.${index}.start_time`)} />
                  </div>

                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input type="time" {...form.register(`slots.${index}.end_time`)} />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => fieldArray.remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 md:col-span-4">
                    <Label>Preference note</Label>
                    <Input {...form.register(`slots.${index}.preference_note`)} placeholder="Optional note" />
                  </div>
                </CardContent>
              </Card>
            ))}

            {query.isPending && <p className="text-sm text-muted-foreground">Loading availability...</p>}
            {query.isError && <Alert variant="destructive"><AlertDescription>Unable to load availability.</AlertDescription></Alert>}
            {mutation.isError && <Alert variant="destructive"><AlertDescription>Unable to save availability.</AlertDescription></Alert>}
            {mutation.isSuccess && <Alert><AlertDescription>Availability saved.</AlertDescription></Alert>}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fieldArray.append(defaultSlot)}
              >
                <Plus className="h-4 w-4" />
                Add Slot
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Availability"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
