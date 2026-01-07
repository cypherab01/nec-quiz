import { Difficulty } from "@/app/generated/prisma/enums";

export type PublicQuestion = {
  id: string;
  question: string;
  choices: string[];
  difficulty: Difficulty;
  tags: string[];
};
