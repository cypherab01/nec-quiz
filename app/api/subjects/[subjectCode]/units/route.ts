import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/authz";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subjectCode: string }> }
) {
  try {
    await requireSessionUser(request);
  } catch {
    return jsonError(401, "UNAUTHORIZED", "Login required.");
  }

  const { subjectCode } = await params;

  const subject = await prisma.subject.findUnique({
    where: { code: subjectCode },
    select: { id: true },
  });

  if (!subject) {
    return jsonError(404, "NOT_FOUND", "Subject not found.");
  }

  try {
    if (!("unit" in prisma)) {
      return jsonError(
        500,
        "PRISMA_CLIENT_OUTDATED",
        "PrismaClient is missing the Unit model. Stop the dev server, run `bunx prisma generate`, then restart `bun dev`."
      );
    }

    const units = await prisma.unit.findMany({
      where: { subjectId: subject.id },
      orderBy: { code: "asc" },
      select: {
        code: true,
        name: true,
        _count: { select: { topics: true } },
      },
    });

    return Response.json({ ok: true, data: units });
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
