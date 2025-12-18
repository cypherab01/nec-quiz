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

  const rows = await prisma.quizAttempt.groupBy({
    by: ["userId"],
    _count: { _all: true },
    _sum: { correctCount: true, totalCount: true },
    _max: { submittedAt: true },
    orderBy: [{ _sum: { correctCount: "desc" } }, { _max: { submittedAt: "desc" } }],
    take: 50,
  });

  const userIds = rows.map((r) => r.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userById = new Map(users.map((u) => [u.id, u]));

  const data = rows.map((r) => {
    const u = userById.get(r.userId);
    const totalQuestions = r._sum.totalCount ?? 0;
    const totalCorrect = r._sum.correctCount ?? 0;
    const accuracy = totalQuestions > 0 ? totalCorrect / totalQuestions : 0;
    return {
      userId: r.userId,
      name: u?.name ?? "Unknown",
      email: u?.email ?? "",
      attempts: r._count._all,
      totalCorrect,
      totalQuestions,
      accuracy,
      lastSubmittedAt: r._max.submittedAt,
    };
  });

  return Response.json({ ok: true, data });
}


