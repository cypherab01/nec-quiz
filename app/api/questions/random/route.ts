import { NotFoundError } from "@/helpers/api/errors";
import { withErrorHandling } from "@/helpers/api/handler";
import { ok } from "@/helpers/api/response";
import { requireSession } from "@/helpers/api/session-validation";
import { validateBody } from "@/helpers/api/validate";
import prisma from "@/lib/prisma";
import { idSchema } from "@/types/schema/id";

// get subject id and return random questions

export const POST = withErrorHandling(async (req) => {
  await requireSession(req);

  const { subjectId } = await req.json();

  validateBody(idSchema, subjectId);

  const db_subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!db_subject) {
    throw new NotFoundError("Subject");
  }

  const total = await prisma.question.count({
    where: {
      unit: {
        subjectId,
      },
    },
  });

  const limit = 10;
  if (total === 0 || total < limit) {
    throw new NotFoundError("Enough questions");
  }

  const take = Math.min(limit, total);
  const skip = Math.max(0, Math.floor(Math.random() * (total - take)));

  const questions = await prisma.question.findMany({
    where: {
      unit: { subjectId },
    },
    take,
    skip,
    select: {
      id: true,
      question: true,
      choices: true,
      difficulty: true,
      tags: true,
    },
  });

  return ok(questions, "Questions fetched", 200);
});
