import { ApiError } from "@/helpers/api/errors";
import { withErrorHandling } from "@/helpers/api/handler";
import { ok } from "@/helpers/api/response";
import { requireAdmin, requireSession } from "@/helpers/api/session-validation";
import { validateBody } from "@/helpers/api/validate";
import prisma from "@/lib/prisma";
import { createSubjectSchema } from "@/types/schema/create-subject";

export const POST = withErrorHandling(async (req) => {
  const session = await requireSession(req);

  requireAdmin(session);

  const body = await req.json();
  const data = validateBody(createSubjectSchema, body);

  const existingSubject = await prisma.subject.findUnique({
    where: {
      code: data.code,
    },
  });

  if (existingSubject) {
    throw new ApiError(
      "Subject with this code already exists",
      400,
      "SUBJECT_CODE_ALREADY_EXISTS"
    );
  }

  const subject = await prisma.subject.create({
    data,
  });

  return ok(subject, "Subject created", 201);
});
