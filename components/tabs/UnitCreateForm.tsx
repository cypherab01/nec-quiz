import { Subject } from "@/app/generated/prisma/client";
import { apiClient } from "@/helpers/api/axios";
import { useUnitCreate } from "@/hooks/useUnitCreate";
import { createUnitSchema } from "@/types/schema/create-unit";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const UnitCreateForm = () => {
  const form = useForm<z.infer<typeof createUnitSchema>>({
    resolver: zodResolver(createUnitSchema),
    defaultValues: {
      code: "",
      name: "",
      subjectId: undefined,
    },
  });

  const { mutate: createUnit, isPending } = useUnitCreate();

  // Fetch subjects for the dropdown
  const { data: subjectsResponse } = useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await apiClient.get<{
        success: boolean;
        data: Subject[];
        message?: string;
      }>("/subjects");
      return response;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const subjects: Subject[] =
    (subjectsResponse as { data: Subject[] } | undefined)?.data ?? [];

  function onSubmit(data: z.infer<typeof createUnitSchema>) {
    createUnit(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Unit</CardTitle>
        <CardDescription>
          Create a new unit here. Click save when you&apos;re done.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form id="create-unit-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* subject selection */}
            <Controller
              name="subjectId"
              defaultValue={undefined}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-unit-form-subject">
                    Subject
                  </FieldLabel>
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="create-unit-form-subject"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* unit name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-unit-form-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="create-unit-form-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter the name of the unit"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* unit code */}
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="create-unit-form-code">Code</FieldLabel>
                  <Input
                    {...field}
                    id="create-unit-form-code"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter the code for the unit"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="create-unit-form" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Unit...
            </>
          ) : (
            "Create Unit"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
