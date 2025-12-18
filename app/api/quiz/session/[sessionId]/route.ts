import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/authz";

function jsonError(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  let userId: string;
  try {
    const u = await requireSessionUser(request);
    userId = u.userId;
  } catch {
    return jsonError(401, "UNAUTHORIZED", "Login required.");
  }

  const { sessionId } = await params;

  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      expiresAt: true,
      mode: true,
      count: true,
      subject: { select: { code: true, name: true } },
      unitCode: true,
      questions: {
        orderBy: { orderIndex: "asc" },
        select: {
          orderIndex: true,
          question: {
            select: {
              externalId: true,
              prompt: true,
              choices: true,
              difficulty: true,
              unit: { select: { code: true } },
            },
          },
        },
      },
    },
  });

  if (!session) return jsonError(404, "NOT_FOUND", "Quiz session not found.");
  if (session.userId !== userId)
    return jsonError(403, "FORBIDDEN", "Not your quiz session.");
  if (new Date(session.expiresAt).getTime() < Date.now())
    return jsonError(410, "EXPIRED", "Quiz session expired. Start a new quiz.");

  const attempt = await prisma.quizAttempt.findFirst({
    where: { quizSessionId: session.id, userId },
    orderBy: { submittedAt: "desc" },
    select: {
      id: true,
      submittedAt: true,
      correctCount: true,
      totalCount: true,
      answers: {
        select: {
          selectedIndex: true,
          isCorrect: true,
          question: {
            select: {
              externalId: true,
              correctIndex: true,
              explanation: true,
            },
          },
        },
      },
    },
  });

  return Response.json({
    ok: true,
    data: {
      sessionId: session.id,
      startedAt: session.createdAt,
      expiresAt: session.expiresAt,
      mode: session.mode,
      count: session.count,
      subject: session.subject,
      unitCode: session.unitCode,
      questions: session.questions.map((q) => ({
        orderIndex: q.orderIndex,
        ...q.question,
      })),
      attempt: attempt
        ? {
            attemptId: attempt.id,
            submittedAt: attempt.submittedAt,
            score: { correct: attempt.correctCount, total: attempt.totalCount },
            results: attempt.answers.map((a) => ({
              externalId: a.question.externalId,
              selectedIndex: a.selectedIndex,
              correctIndex: a.question.correctIndex,
              isCorrect: a.isCorrect,
              explanation: a.question.explanation,
            })),
          }
        : null,
    },
  });
}
