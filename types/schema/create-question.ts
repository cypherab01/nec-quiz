import { Difficulty } from "@/app/generated/prisma/enums";
import { z } from "zod";

export const createQuestionSchema = z.object({
  question: z.string().min(1, "Question is required"),
  unitId: z.string().min(1, "Unit Id is required"),
  choices: z.array(z.string()).length(4, "Exactly 4 choices are required"),
  correctIndex: z
    .number()
    .int("Correct index must be an integer")
    .min(0)
    .max(3),
  explanation: z.string().optional(),
  difficulty: z.enum(Difficulty),
  tags: z.array(z.string()).optional(),
});

export type CreateQuestion = z.infer<typeof createQuestionSchema>;
