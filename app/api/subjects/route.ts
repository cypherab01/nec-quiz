import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/authz";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

export async function GET(request: Request) {
  try {
    await requireSessionUser(request);
  } catch {
    return jsonError(401, "UNAUTHORIZED", "Login required.");
  }

  try {
    if (!("subject" in prisma)) {
      return jsonError(
        500,
        "PRISMA_CLIENT_OUTDATED",
        "PrismaClient is missing the Subject model. Stop the dev server, run `bunx prisma generate`, then restart `bun dev`."
      );
    }

    const subjects = await prisma.subject.findMany({
      orderBy: { code: "asc" },
      select: {
        code: true,
        name: true,
        _count: { select: { units: true } },
      },
    });

    return Response.json({ ok: true, data: subjects });
  } catch (e) {
    // Common in dev if migrations haven't been applied yet.
    return jsonError(
      500,
      "DB_ERROR",
      e instanceof Error
        ? `${e.message} (Did you run prisma migrate + seed?)`
        : "Database error. Did you run prisma migrate + seed?"
    );
  }
}
