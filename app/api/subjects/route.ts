import { ApiError } from "@/helpers/api/errors";
import { withErrorHandling } from "@/helpers/api/handler";
import { ok } from "@/helpers/api/response";
import { requireSession } from "@/helpers/api/session-validation";
import prisma from "@/lib/prisma";

export const GET = withErrorHandling(async (req) => {
  const session = await requireSession(req);

  if (!session.roles) {
    throw new ApiError(
      "You are not authorized to access this resource",
      403,
      "FORBIDDEN"
    );
  }

  const subjects = await prisma.subject.findMany();

  return ok(subjects, "Subjects fetched", 200);
});
