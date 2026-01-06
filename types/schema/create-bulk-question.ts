import { z } from "zod";
import { createQuestionSchema } from "./create-question";

export const createQuestionBulkSchema = z
  .array(createQuestionSchema)
  .min(1, "At least one question is required")
  .max(1000, "Maximum 1000 questions allowed");

export type CreateQuestionBulk = z.infer<typeof createQuestionBulkSchema>;
