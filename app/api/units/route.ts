import { ApiError, NotFoundError } from "@/helpers/api/errors";
import { withErrorHandling } from "@/helpers/api/handler";
import { ok } from "@/helpers/api/response";
import { requireSession } from "@/helpers/api/session-validation";
import prisma from "@/lib/prisma";

// export const GET = withErrorHandling(async (req) => {
//   await requireSession(req);

//   const units = await prisma.unit.findMany();
//   return ok(units, "Units fetched", 200);
// });

export const POST = withErrorHandling(async (req) => {
  await requireSession(req);

  const { subjectCode } = await req.json();

  if (!subjectCode) {
    throw new ApiError(
      "Subject Code is required",
      400,
      "SUBJECT_CODE_REQUIRED"
    );
  }

  const subject = await prisma.subject.findUnique({
    where: { code: subjectCode },
  });

  if (!subject) {
    throw new NotFoundError("Subject");
  }

  const units = await prisma.unit.findMany({
    where: { subjectId: subject.id },
  });

  return ok(units, "Units fetched", 200);
});
