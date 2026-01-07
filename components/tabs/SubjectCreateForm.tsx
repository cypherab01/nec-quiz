import { useSubjectCreate } from "@/hooks/useSubjectCreate";
import { createSubjectSchema } from "@/types/schema/create-subject";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export const SubjectCreateForm = () => {
  const form = useForm<z.infer<typeof createSubjectSchema>>({
    resolver: zodResolver(createSubjectSchema),
    defaultValues: {
      code: "",
      name: "",
    },
  });

  const { mutate: createSubject, isPending } = useSubjectCreate();

  function onSubmit(data: z.infer<typeof createSubjectSchema>) {
    createSubject(data, {
      onSuccess: () => {
        form.reset();
      },
    });
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Subject</CardTitle>
        <CardDescription>
          Create a new subject here. Click save when you&apos;re done.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <form id="create-subject-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            {/* subject name */}
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">Name</FieldLabel>
                  <Input
                    {...field}
                    id="create-subject-form-name"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter the name of the subject"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {/* subject code */}
            <Controller
              name="code"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-rhf-demo-title">Code</FieldLabel>
                  <Input
                    {...field}
                    id="create-subject-form-code"
                    aria-invalid={fieldState.invalid}
                    placeholder="Enter the code for the subject"
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
        <Button type="submit" form="create-subject-form" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating Subject...
            </>
          ) : (
            "Create Subject"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
