import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/authz";

type SubmitBody = {
  sessionId: string;
  answers: Array<{
    externalId: string;
    selectedIndex: 0 | 1 | 2 | 3;
  }>;
};

function jsonError(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

function isSelectedIndex(v: unknown): v is 0 | 1 | 2 | 3 {
  return v === 0 || v === 1 || v === 2 || v === 3;
}

function parseSubmitBody(body: unknown): SubmitBody {
  const b = body as Partial<SubmitBody>;
  if (!b?.sessionId || typeof b.sessionId !== "string") {
    throw new TypeError("`sessionId` is required.");
  }
  if (!Array.isArray(b.answers)) {
    throw new TypeError("`answers` must be an array.");
  }
  return { sessionId: b.sessionId, answers: b.answers as any };
}

function normalizeAnswers(
  input: SubmitBody["answers"],
  questionByExternalId: Map<
    string,
    {
      id: string;
      externalId: string;
      correctIndex: number;
      explanation: string | null;
    }
  >
) {
  const seen = new Set<string>();
  const normalized: Array<{
    questionId: string;
    externalId: string;
    selectedIndex: number;
  }> = [];

  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const externalId = (raw as any).externalId;
    const selectedIndex = (raw as any).selectedIndex;
    if (typeof externalId !== "string") continue;
    if (seen.has(externalId)) continue;
    if (!isSelectedIndex(selectedIndex)) continue;

    const q = questionByExternalId.get(externalId);
    if (!q) continue;

    seen.add(externalId);
    normalized.push({ questionId: q.id, externalId, selectedIndex });
  }

  return normalized;
}

async function getExistingAttemptResponse(input: {
  quizSessionId: string;
  userId: string;
}) {
  const attempt = await prisma.quizAttempt.findFirst({
    where: { quizSessionId: input.quizSessionId, userId: input.userId },
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

  if (!attempt) return null;

  return {
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
  };
}

export async function POST(request: Request) {
  let userId: string;
  try {
    const u = await requireSessionUser(request);
    userId = u.userId;
  } catch {
    return jsonError(401, "UNAUTHORIZED", "Login required.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Body must be valid JSON.");
  }

  let b: SubmitBody;
  try {
    b = parseSubmitBody(body);
  } catch (e) {
    return jsonError(
      400,
      "INVALID_BODY",
      e instanceof Error ? e.message : "Invalid request body."
    );
  }

  const session = await prisma.quizSession.findUnique({
    where: { id: b.sessionId },
    select: {
      id: true,
      userId: true,
      expiresAt: true,
      questions: {
        select: {
          question: {
            select: {
              id: true,
              externalId: true,
              correctIndex: true,
              explanation: true,
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

  // Idempotency: one attempt per session per user (by convention).
  const existing = await getExistingAttemptResponse({
    quizSessionId: session.id,
    userId,
  });
  if (existing) {
    return Response.json({ ok: true, data: existing });
  }

  const questionList = session.questions.map((x) => x.question);
  const questionByExternalId = new Map(
    questionList.map((q) => [q.externalId, q])
  );

  const normalized = normalizeAnswers(b.answers, questionByExternalId);

  const total = questionList.length;
  if (normalized.length !== total) {
    return jsonError(
      400,
      "INCOMPLETE",
      `Answers incomplete. Expected ${total}, got ${normalized.length}.`
    );
  }

  const scored = normalized.map((a) => {
    const q = questionByExternalId.get(a.externalId)!;
    const isCorrect = a.selectedIndex === q.correctIndex;
    return {
      ...a,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      isCorrect,
    };
  });

  const correctCount = scored.reduce(
    (acc, s) => acc + (s.isCorrect ? 1 : 0),
    0
  );

  const attempt = await prisma.$transaction(async (tx) => {
    const createdAttempt = await tx.quizAttempt.create({
      data: {
        quizSessionId: session.id,
        userId,
        totalCount: total,
        correctCount,
      },
      select: { id: true, submittedAt: true },
    });

    await tx.quizAttemptAnswer.createMany({
      data: scored.map((s) => ({
        quizAttemptId: createdAttempt.id,
        questionId: s.questionId,
        selectedIndex: s.selectedIndex,
        isCorrect: s.isCorrect,
      })),
    });

    return createdAttempt;
  });

  return Response.json({
    ok: true,
    data: {
      attemptId: attempt.id,
      submittedAt: attempt.submittedAt,
      score: { correct: correctCount, total },
      results: scored.map((s) => ({
        externalId: s.externalId,
        selectedIndex: s.selectedIndex,
        correctIndex: s.correctIndex,
        isCorrect: s.isCorrect,
        explanation: s.explanation,
      })),
    },
  });
}
