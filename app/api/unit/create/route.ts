import { ApiError, NotFoundError } from "@/helpers/api/errors";
import { withErrorHandling } from "@/helpers/api/handler";
import { ok } from "@/helpers/api/response";
import { requireAdmin, requireSession } from "@/helpers/api/session-validation";
import { validateBody } from "@/helpers/api/validate";
import prisma from "@/lib/prisma";
import { createUnitSchema } from "@/types/schema/create-unit";

export const POST = withErrorHandling(async (req) => {
  const session = await requireSession(req);

  requireAdmin(session);

  const body = await req.json();
  const data = validateBody(createUnitSchema, body);

  const subject = await prisma.subject.findUnique({
    where: { id: data.subjectId },
  });

  if (!subject) {
    throw new NotFoundError("Subject");
  }

  // check if unit with this code already exists
  const existingUnit = await prisma.unit.findUnique({
    where: { subjectId_code: { subjectId: data.subjectId, code: data.code } },
  });

  if (existingUnit) {
    throw new ApiError(
      "Unit with this code already exists",
      400,
      "UNIT_CODE_ALREADY_EXISTS"
    );
  }

  const unit = await prisma.unit.create({
    data,
  });

  return ok(unit, "Unit created", 201);
});
