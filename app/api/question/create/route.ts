import { NotFoundError } from "@/helpers/api/errors";
import { withErrorHandling } from "@/helpers/api/handler";
import { ok } from "@/helpers/api/response";
import { requireAdmin, requireSession } from "@/helpers/api/session-validation";
import { validateBody } from "@/helpers/api/validate";
import prisma from "@/lib/prisma";
import { createQuestionSchema } from "@/types/schema/create-question";

export const POST = withErrorHandling(async (req) => {
  const session = await requireSession(req);

  requireAdmin(session);

  const body = await req.json();
  const data = validateBody(createQuestionSchema, body);

  const unit = await prisma.unit.findUnique({
    where: { id: data.unitId },
  });

  if (!unit) {
    throw new NotFoundError("Unit");
  }

  const question = await prisma.question.create({ data });

  return ok(question, "Question created", 201);
});
