import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/authz";

type ImportPayloadV1 = {
  version: "v1";
  subjectCode: string;
  subjectName: string;
  unitCode: string;
  unitName: string;
  questions: Array<{
    externalId: string;
    prompt: string;
    choices: [string, string, string, string];
    correctIndex: 0 | 1 | 2 | 3;
    explanation?: string;
    difficulty?: "easy" | "medium" | "hard";
    tags?: string[];
    references?: string[];
  }>;
};

function jsonError(status: number, code: string, message: string) {
  return Response.json(
    { ok: false, error: { code, message } },
    { status, headers: { "content-type": "application/json" } }
  );
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function parsePayload(body: unknown): ImportPayloadV1 {
  if (!body || typeof body !== "object") {
    throw new Error("Body must be a JSON object.");
  }

  const b = body as Partial<ImportPayloadV1>;

  if (b.version !== "v1") throw new Error('`version` must be "v1".');

  const requiredStrings: Array<[keyof ImportPayloadV1, unknown]> = [
    ["subjectCode", b.subjectCode],
    ["subjectName", b.subjectName],
    ["unitCode", b.unitCode],
    ["unitName", b.unitName],
  ];
  for (const [k, v] of requiredStrings) {
    if (!isNonEmptyString(v)) throw new Error(`\`${String(k)}\` is required.`);
  }

  const questions = b.questions;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("`questions` must be a non-empty array.");
  }

  const externalIds = new Set<string>();

  questions.forEach((q, idx) => {
    if (!q || typeof q !== "object")
      throw new Error(`questions[${idx}] invalid`);
    const qq = q;

    if (!isNonEmptyString(qq.externalId))
      throw new Error(`questions[${idx}].externalId is required`);
    if (externalIds.has(qq.externalId))
      throw new Error(`Duplicate externalId in payload: ${qq.externalId}`);
    externalIds.add(qq.externalId);

    if (!isNonEmptyString(qq.prompt))
      throw new Error(`questions[${idx}].prompt is required`);

    if (!Array.isArray(qq.choices) || qq.choices.length !== 4)
      throw new Error(`questions[${idx}].choices must have exactly 4 items`);
    if (!qq.choices.every(isNonEmptyString))
      throw new Error(`questions[${idx}].choices must be non-empty strings`);

    if (
      typeof qq.correctIndex !== "number" ||
      qq.correctIndex < 0 ||
      qq.correctIndex > 3
    ) {
      throw new Error(`questions[${idx}].correctIndex must be 0..3`);
    }

    if (qq.tags !== undefined && !isStringArray(qq.tags)) {
      throw new Error(`questions[${idx}].tags must be string[]`);
    }
    if (qq.references !== undefined && !isStringArray(qq.references)) {
      throw new Error(`questions[${idx}].references must be string[]`);
    }
    if (
      qq.difficulty !== undefined &&
      qq.difficulty !== "easy" &&
      qq.difficulty !== "medium" &&
      qq.difficulty !== "hard"
    ) {
      throw new Error(`questions[${idx}].difficulty must be easy|medium|hard`);
    }
    if (qq.explanation !== undefined && !isNonEmptyString(qq.explanation)) {
      throw new Error(`questions[${idx}].explanation must be a string`);
    }
  });

  return {
    version: "v1",
    subjectCode: b.subjectCode!,
    subjectName: b.subjectName!,
    unitCode: b.unitCode!,
    unitName: b.unitName!,
    questions,
  };
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);
  } catch {
    return jsonError(403, "FORBIDDEN", "Admin access required.");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "INVALID_JSON", "Request body must be valid JSON.");
  }

  let payload: ImportPayloadV1;
  try {
    payload = parsePayload(body);
  } catch (e) {
    return jsonError(
      400,
      "INVALID_PAYLOAD",
      e instanceof Error ? e.message : "Invalid payload."
    );
  }

  const { subjectCode, subjectName, unitCode, unitName, questions } = payload;

  const result = await prisma.$transaction(async (tx) => {
    const subject = await tx.subject.upsert({
      where: { code: subjectCode },
      create: { code: subjectCode, name: subjectName },
      update: { name: subjectName },
      select: { id: true },
    });

    const unit = await tx.unit.upsert({
      where: { subjectId_code: { subjectId: subject.id, code: unitCode } },
      create: { subjectId: subject.id, code: unitCode, name: unitName },
      update: { name: unitName },
      select: { id: true },
    });

    const ops = questions.map((q) =>
      tx.question.upsert({
        where: { externalId: q.externalId },
        create: {
          unitId: unit.id,
          externalId: q.externalId,
          prompt: q.prompt,
          choices: q.choices,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
          tags: q.tags ?? [],
          references: q.references ?? [],
          isActive: true,
        },
        update: {
          unitId: unit.id,
          prompt: q.prompt,
          choices: q.choices,
          correctIndex: q.correctIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
          tags: q.tags ?? [],
          references: q.references ?? [],
          isActive: true,
        },
        select: { id: true },
      })
    );

    const upserted = await Promise.all(ops);

    return {
      subjectId: subject.id,
      unitId: unit.id,
      questionsUpserted: upserted.length,
    };
  });

  return Response.json({ ok: true, data: result });
}
