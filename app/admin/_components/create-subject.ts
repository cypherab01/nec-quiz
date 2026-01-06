import z from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long"),
  code: z.string().min(3, "Code must be at least 3 characters long"),
});
