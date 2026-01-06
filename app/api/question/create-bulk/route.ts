import { NotFoundError } from "@/helpers/api/errors";
import { withErrorHandling } from "@/helpers/api/handler";
import { ok } from "@/helpers/api/response";
import { requireAdmin, requireSession } from "@/helpers/api/session-validation";
import { validateBody } from "@/helpers/api/validate";
import prisma from "@/lib/prisma";
import { createQuestionBulkSchema } from "@/types/schema/create-bulk-question";

export const POST = withErrorHandling(async (req) => {
  const session = await requireSession(req);
  requireAdmin(session);

  const body = await req.json();
  const data = validateBody(createQuestionBulkSchema, body);

  // 1️⃣ Collect unique unitIds
  const unitIds = [...new Set(data.map((q) => q.unitId))];

  // 2️⃣ Validate all units exist (single query)
  const units = await prisma.unit.findMany({
    where: { id: { in: unitIds } },
    select: { id: true },
  });

  if (units.length !== unitIds.length) {
    throw new NotFoundError("One or more units");
  }

  // 3️⃣ Bulk insert
  const result = await prisma.question.createMany({
    data,
    skipDuplicates: true, // optional
  });

  return ok(
    {
      inserted: result.count,
      requested: data.length,
    },
    "Questions created successfully",
    201
  );
});
