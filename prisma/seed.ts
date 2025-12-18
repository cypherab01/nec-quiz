import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { auth } from "../lib/auth";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const DEV_ADMIN_EMAIL = "admin@admin.com";
const DEV_ADMIN_PASSWORD = "password";
const DEV_ADMIN_NAME = "Admin";
const DEV_STUDENT_EMAIL = "user@user.com";
const DEV_STUDENT_PASSWORD = "password";
const DEV_STUDENT_NAME = "User";

async function seedSampleQuestions() {
  // DEV-ONLY sample content for quick testing of the quiz flow + bulk import.
  // Safe to re-run (uses upserts).

  const subject = await prisma.subject.upsert({
    where: { code: "ACtE" },
    create: { code: "ACtE", name: "Computer Engineering" },
    update: { name: "Computer Engineering" },
    select: { id: true },
  });

  // Unit: AExE01 / Topic: AExE0101
  const unitAExE01 = await prisma.unit.upsert({
    where: { subjectId_code: { subjectId: subject.id, code: "AExE01" } },
    create: {
      subjectId: subject.id,
      code: "AExE01",
      name: "Concept of Basic Electrical and Electronics Engineering",
    },
    update: { name: "Concept of Basic Electrical and Electronics Engineering" },
    select: { id: true },
  });

  const topicAExE0101 = await prisma.topic.upsert({
    where: { unitId_code: { unitId: unitAExE01.id, code: "AExE0101" } },
    create: { unitId: unitAExE01.id, code: "AExE0101", name: "Basic concept" },
    update: { name: "Basic concept" },
    select: { id: true },
  });

  await prisma.question.upsert({
    where: { externalId: "AExE01-AExE0101-0001" },
    create: {
      topicId: topicAExE0101.id,
      externalId: "AExE01-AExE0101-0001",
      prompt: "Ohm’s law relates which quantities?",
      choices: [
        "Voltage, current, and resistance",
        "Power and energy only",
        "Charge and flux",
        "Capacitance and inductance",
      ],
      correctIndex: 0,
      explanation:
        "Ohm’s law is V = I·R, relating voltage (V), current (I), and resistance (R).",
      difficulty: "easy",
      tags: ["ohms-law", "basics"],
      references: ["NEC syllabus AExE01: Basic concept"],
      isActive: true,
    },
    update: {
      topicId: topicAExE0101.id,
      prompt: "Ohm’s law relates which quantities?",
      choices: [
        "Voltage, current, and resistance",
        "Power and energy only",
        "Charge and flux",
        "Capacitance and inductance",
      ],
      correctIndex: 0,
      explanation:
        "Ohm’s law is V = I·R, relating voltage (V), current (I), and resistance (R).",
      difficulty: "easy",
      tags: ["ohms-law", "basics"],
      references: ["NEC syllabus AExE01: Basic concept"],
      isActive: true,
    },
  });

  // Generate enough questions for quiz sizes (25/50/75/100).
  // We'll create 100 questions in this topic (including 0001 above).
  const genAExE0101 = Array.from({ length: 99 }).map((_, i) => {
    const seq = i + 2; // start at 0002
    const externalId = `AExE01-AExE0101-${String(seq).padStart(4, "0")}`;
    return {
      externalId,
      prompt: `Sample (AExE0101) Question ${seq}: In a DC circuit, if V=10V and R=5Ω, current I equals?`,
      choices: ["2 A", "0.5 A", "5 A", "50 A"],
      correctIndex: 0 as const,
      explanation: "Using Ohm’s law I = V/R = 10/5 = 2 A.",
      difficulty: (seq % 3 === 0 ? "medium" : "easy") as "easy" | "medium" | "hard",
      tags: ["seed", "aexe0101"],
      references: ["DEV seed data"],
    };
  });

  // Use createMany + skipDuplicates for speed and to avoid transaction timeouts.
  // Idempotent enough for dev seeding: existing questions are left as-is.
  await prisma.question.createMany({
    data: genAExE0101.map((q) => ({
      topicId: topicAExE0101.id,
      externalId: q.externalId,
      prompt: q.prompt,
      choices: q.choices,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
      tags: q.tags,
      references: q.references,
      isActive: true,
    })),
    skipDuplicates: true,
  });

  // Unit: AExE02 / Topic: AExE0201
  const unitAExE02 = await prisma.unit.upsert({
    where: { subjectId_code: { subjectId: subject.id, code: "AExE02" } },
    create: {
      subjectId: subject.id,
      code: "AExE02",
      name: "Digital Logic and Microprocessor",
    },
    update: { name: "Digital Logic and Microprocessor" },
    select: { id: true },
  });

  const topicAExE0201 = await prisma.topic.upsert({
    where: { unitId_code: { unitId: unitAExE02.id, code: "AExE0201" } },
    create: { unitId: unitAExE02.id, code: "AExE0201", name: "Digital logic" },
    update: { name: "Digital logic" },
    select: { id: true },
  });

  await prisma.question.upsert({
    where: { externalId: "AExE02-AExE0201-0001" },
    create: {
      topicId: topicAExE0201.id,
      externalId: "AExE02-AExE0201-0001",
      prompt: "Binary number 1011 is equivalent to decimal:",
      choices: ["11", "10", "12", "13"],
      correctIndex: 0,
      explanation: "1011₂ = 8 + 2 + 1 = 11₁₀.",
      difficulty: "easy",
      tags: ["number-systems", "binary"],
      references: ["NEC syllabus AExE0201: Number Systems"],
      isActive: true,
    },
    update: {
      topicId: topicAExE0201.id,
      prompt: "Binary number 1011 is equivalent to decimal:",
      choices: ["11", "10", "12", "13"],
      correctIndex: 0,
      explanation: "1011₂ = 8 + 2 + 1 = 11₁₀.",
      difficulty: "easy",
      tags: ["number-systems", "binary"],
      references: ["NEC syllabus AExE0201: Number Systems"],
      isActive: true,
    },
  });

  // Create another 100 questions in this topic (including 0001 above) => total ~200 across subject.
  const genAExE0201 = Array.from({ length: 99 }).map((_, i) => {
    const seq = i + 2; // start at 0002
    const externalId = `AExE02-AExE0201-${String(seq).padStart(4, "0")}`;
    const n = seq + 5;
    return {
      externalId,
      prompt: `Sample (AExE0201) Question ${seq}: Decimal ${n} in binary is:`,
      choices: [
        n.toString(2),
        (n + 1).toString(2),
        (n + 2).toString(2),
        (n - 1).toString(2),
      ],
      correctIndex: 0 as const,
      explanation: `Convert ${n}₁₀ to binary.`,
      difficulty: (seq % 4 === 0 ? "medium" : "easy") as "easy" | "medium" | "hard",
      tags: ["seed", "aexe0201"],
      references: ["DEV seed data"],
    };
  });

  await prisma.question.createMany({
    data: genAExE0201.map((q) => ({
      topicId: topicAExE0201.id,
      externalId: q.externalId,
      prompt: q.prompt,
      choices: q.choices,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      difficulty: q.difficulty,
      tags: q.tags,
      references: q.references,
      isActive: true,
    })),
    skipDuplicates: true,
  });
}

export async function main() {
  // DEV-ONLY seed: creates an admin user for local development.
  // IMPORTANT: Do not use these credentials in production.

  if (process.env.NODE_ENV === "production") {
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: DEV_ADMIN_EMAIL },
    select: { id: true },
  });

  let userId = existing?.id;

  if (!userId) {
    const res = await auth.api.signUpEmail({
      body: {
        name: DEV_ADMIN_NAME,
        email: DEV_ADMIN_EMAIL,
        password: DEV_ADMIN_PASSWORD,
      },
    });
    // `res.user.id` is the Better Auth user id.
    userId = res.user.id;
  }

  await prisma.userProfile.upsert({
    where: { userId },
    create: { userId, role: "admin" },
    update: { role: "admin" },
  });

  // DEV-ONLY seed: create a default student for quick testing.
  const existingStudent = await prisma.user.findUnique({
    where: { email: DEV_STUDENT_EMAIL },
    select: { id: true },
  });

  let studentUserId = existingStudent?.id;
  if (!studentUserId) {
    const res = await auth.api.signUpEmail({
      body: {
        name: DEV_STUDENT_NAME,
        email: DEV_STUDENT_EMAIL,
        password: DEV_STUDENT_PASSWORD,
      },
    });
    studentUserId = res.user.id;
  }

  await prisma.userProfile.upsert({
    where: { userId: studentUserId },
    create: { userId: studentUserId, role: "student" },
    update: { role: "student" },
  });

  await seedSampleQuestions();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
