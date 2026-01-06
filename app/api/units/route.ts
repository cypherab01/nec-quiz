import { ApiError, NotFoundError } from "@/helpers/api/errors";
import { withErrorHandling } from "@/helpers/api/handler";
import { ok } from "@/helpers/api/response";
import { requireSession } from "@/helpers/api/session-validation";
import prisma from "@/lib/prisma";

export const POST = withErrorHandling(async (req) => {
  await requireSession(req);

  const { subjectId } = await req.json();

  if (!subjectId) {
    throw new ApiError("Subject Id is required", 400, "SUBJECT_ID_REQUIRED");
  }

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
  });

  if (!subject) {
    throw new NotFoundError("Subject");
  }

  const units = await prisma.unit.findMany({
    where: { subjectId },
  });

  return ok(units, "Units fetched", 200);
});
