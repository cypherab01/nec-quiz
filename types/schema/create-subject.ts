import { z } from "zod";

export const createSubjectSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters long"),
  name: z.string().min(3, "Name must be at least 3 characters long"),
});

export type CreateSubject = z.infer<typeof createSubjectSchema>;
