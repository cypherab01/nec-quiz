import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/authz";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subjectCode: string; unitCode: string }> }
) {
  try {
    await requireSessionUser(request);
  } catch {
    return jsonError(401, "UNAUTHORIZED", "Login required.");
  }

  const { subjectCode, unitCode } = await params;

  const subject = await prisma.subject.findUnique({
    where: { code: subjectCode },
    select: { id: true },
  });
  if (!subject) return jsonError(404, "NOT_FOUND", "Subject not found.");

  const unit = await prisma.unit.findUnique({
    where: { subjectId_code: { subjectId: subject.id, code: unitCode } },
    select: { id: true },
  });
  if (!unit) return jsonError(404, "NOT_FOUND", "Unit not found.");

  try {
    if (!("topic" in prisma)) {
      return jsonError(
        500,
        "PRISMA_CLIENT_OUTDATED",
        "PrismaClient is missing the Topic model. Stop the dev server, run `bunx prisma generate`, then restart `bun dev`."
      );
    }

    const topics = await prisma.topic.findMany({
      where: { unitId: unit.id },
      orderBy: { code: "asc" },
      select: {
        code: true,
        name: true,
        _count: { select: { questions: true } },
      },
    });

    return Response.json({ ok: true, data: topics });
  } catch (e) {
    return jsonError(
      500,
      "DB_ERROR",
      e instanceof Error
        ? `${e.message} (Did you run prisma migrate + seed?)`
        : "Database error. Did you run prisma migrate + seed?"
    );
  }
}
