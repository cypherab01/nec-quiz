import { z } from "zod";
import { ApiError } from "@/helpers/api/errors";

type ZodSchema<T> = z.ZodType<T>;

function formatZodErrors(error: z.ZodError) {
  const fields: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!fields[key]) {
      fields[key] = [];
    }
    fields[key].push(issue.message);
  }

  return fields;
}

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): T {
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw new ApiError(
      "Invalid request body",
      422,
      "VALIDATION_ERROR",
      formatZodErrors(parsed.error)
    );
  }

  return parsed.data;
}
