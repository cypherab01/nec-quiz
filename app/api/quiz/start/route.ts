import prisma from "@/lib/prisma";
import { requireSessionUser } from "@/lib/authz";

type StartQuizBody = {
  subjectCode: string;
  mode: "random" | "unitWise";
  count: 25 | 50 | 75 | 100;
  unitCodes?: string[];
};

function jsonError(status: number, code: string, message: string) {
  return Response.json({ ok: false, error: { code, message } }, { status });
}

function shuffleInPlace<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function parseStartBody(body: unknown): StartQuizBody {
  const b = body as Partial<StartQuizBody>;
  if (!b?.subjectCode || typeof b.subjectCode !== "string") {
    throw new Error("`subjectCode` is required.");
  }
  if (b.mode !== "random" && b.mode !== "unitWise") {
    throw new Error("`mode` must be random|unitWise.");
  }
  if (b.count !== 25 && b.count !== 50 && b.count !== 75 && b.count !== 100) {
    throw new Error("`count` must be 25|50|75|100.");
  }
  if (b.mode === "unitWise") {
    if (!Array.isArray(b.unitCodes) || b.unitCodes.length === 0) {
      throw new Error("`unitCodes` must be a non-empty string[] for unitWise.");
    }
    if (
      !b.unitCodes.every((x) => typeof x === "string" && x.trim().length > 0)
    ) {
      throw new Error("`unitCodes` must contain only non-empty strings.");
    }
  }
  return {
    subjectCode: b.subjectCode,
    mode: b.mode,
    count: b.count,
    unitCodes: b.unitCodes,
  };
}

function pickRandom<T>(candidates: T[], count: number) {
  if (candidates.length < count) {
    throw new RangeError(String(candidates.length));
  }
  const copy = [...candidates];
  shuffleInPlace(copy);
  return copy.slice(0, count);
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

  let b: StartQuizBody;
  try {
    b = parseStartBody(body);
  } catch (e) {
    return jsonError(
      400,
      "INVALID_BODY",
      e instanceof Error ? e.message : "Invalid request body."
    );
  }

  const { mode, count } = b;

  const subject = await prisma.subject.findUnique({
    where: { code: b.subjectCode },
    select: { id: true },
  });
  if (!subject) return jsonError(404, "NOT_FOUND", "Subject not found.");

  if (!("question" in prisma)) {
    return jsonError(
      500,
      "PRISMA_CLIENT_OUTDATED",
      "PrismaClient is missing the Question model. Stop the dev server, run `bunx prisma generate`, then restart `bun dev`."
    );
  }

  // Build a where-clause for scope.
  const where =
    mode === "random"
      ? { unit: { subjectId: subject.id }, isActive: true }
      : {
          unit: { subjectId: subject.id, code: { in: b.unitCodes ?? [] } },
          isActive: true,
        };

  // Fetch some candidates and shuffle client-side for “random enough” ordering.
  const candidates = await prisma.question.findMany({
    where,
    select: {
      id: true,
      externalId: true,
      prompt: true,
      choices: true,
      difficulty: true,
      unit: { select: { code: true } },
    },
    take: Math.max(500, count * 2),
  });

  let picked: typeof candidates;
  try {
    picked = pickRandom(candidates, count);
  } catch {
    return jsonError(
      400,
      "NOT_ENOUGH_QUESTIONS",
      `Not enough questions in this scope. Requested ${count}, available ${candidates.length}.`
    );
  }

  // Create a server-side session (expires in 24h) and store which questions were served.
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  try {
    const created = await prisma.$transaction(async (tx) => {
      const quizSession = await tx.quizSession.create({
        data: {
          userId,
          subjectId: subject.id,
          mode,
          count,
          unitCode:
            mode === "unitWise" && b.unitCodes?.length === 1
              ? b.unitCodes[0]
              : null,
          expiresAt,
        },
        select: { id: true, createdAt: true, expiresAt: true },
      });

      await tx.quizSessionQuestion.createMany({
        data: picked.map((q, idx) => ({
          quizSessionId: quizSession.id,
          questionId: q.id,
          orderIndex: idx,
        })),
        skipDuplicates: true,
      });

      return quizSession;
    });

    // SECURITY: do NOT return correctIndex/explanation to client.
    return Response.json({
      ok: true,
      data: {
        sessionId: created.id,
        startedAt: created.createdAt.toISOString(),
        expiresAt: created.expiresAt.toISOString(),
      },
    });
  } catch (e) {
    return jsonError(
      500,
      "DB_ERROR",
      e instanceof Error ? e.message : "Failed to create quiz session."
    );
  }
}
