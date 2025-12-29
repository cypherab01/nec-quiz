import { NotFoundError } from "@/helpers/api/errors";
import { withErrorHandling } from "@/helpers/api/handler";
import { ok } from "@/helpers/api/response";
import { requireAdmin, requireSession } from "@/helpers/api/session-validation";
import { validateBody } from "@/helpers/api/validate";
import prisma from "@/lib/prisma";
import { idSchema } from "@/types/schema/id";
import { NextResponse } from "next/server";

export const DELETE = withErrorHandling(
  async (req, { params }): Promise<NextResponse> => {
    const session = await requireSession(req);

    requireAdmin(session);

    const { subjectId: rawSubjectId } = await params;

    const subjectId = validateBody(idSchema, rawSubjectId);

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });

    if (!subject) {
      throw new NotFoundError("Subject not found");
    }

    await prisma.subject.delete({
      where: { id: subjectId },
    });

    return ok(null, "Subject deleted", 200);
  }
);
