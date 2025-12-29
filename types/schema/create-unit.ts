import { z } from "zod";
import { idSchema } from "./id";

export const createUnitSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long"),
  name: z.string().min(3, "Name must be at least 3 characters long"),
  subjectId: idSchema,
});

export type CreateUnit = z.infer<typeof createUnitSchema>;
