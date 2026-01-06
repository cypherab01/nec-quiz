import { ApiError, NotFoundError } from "@/helpers/api/errors";
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

    const { unitId: rawUnitId } = await params;

    const unitId = validateBody(idSchema, rawUnitId);

    // check if subject has units
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
    });

    if (!unit) {
      throw new NotFoundError("Unit");
    }

    await prisma.unit.delete({
      where: { id: unitId },
    });

    return ok(null, "Unit deleted", 200);
  }
);
