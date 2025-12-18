-- CreateEnum
CREATE TYPE "QuizMode" AS ENUM ('random', 'unitWise');

-- CreateTable
CREATE TABLE "quiz_session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "mode" "QuizMode" NOT NULL,
    "count" INTEGER NOT NULL,
    "unitCode" TEXT,
    "topicCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_session_question" (
    "id" TEXT NOT NULL,
    "quizSessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL,

    CONSTRAINT "quiz_session_question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempt" (
    "id" TEXT NOT NULL,
    "quizSessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL,

    CONSTRAINT "quiz_attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempt_answer" (
    "id" TEXT NOT NULL,
    "quizAttemptId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedIndex" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,

    CONSTRAINT "quiz_attempt_answer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quiz_session_userId_idx" ON "quiz_session"("userId");

-- CreateIndex
CREATE INDEX "quiz_session_subjectId_idx" ON "quiz_session"("subjectId");

-- CreateIndex
CREATE INDEX "quiz_session_expiresAt_idx" ON "quiz_session"("expiresAt");

-- CreateIndex
CREATE INDEX "quiz_session_question_questionId_idx" ON "quiz_session_question"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_session_question_quizSessionId_questionId_key" ON "quiz_session_question"("quizSessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_session_question_quizSessionId_orderIndex_key" ON "quiz_session_question"("quizSessionId", "orderIndex");

-- CreateIndex
CREATE INDEX "quiz_attempt_quizSessionId_idx" ON "quiz_attempt"("quizSessionId");

-- CreateIndex
CREATE INDEX "quiz_attempt_userId_idx" ON "quiz_attempt"("userId");

-- CreateIndex
CREATE INDEX "quiz_attempt_answer_questionId_idx" ON "quiz_attempt_answer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_attempt_answer_quizAttemptId_questionId_key" ON "quiz_attempt_answer"("quizAttemptId", "questionId");

-- AddForeignKey
ALTER TABLE "quiz_session" ADD CONSTRAINT "quiz_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_session" ADD CONSTRAINT "quiz_session_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_session_question" ADD CONSTRAINT "quiz_session_question_quizSessionId_fkey" FOREIGN KEY ("quizSessionId") REFERENCES "quiz_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_session_question" ADD CONSTRAINT "quiz_session_question_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_quizSessionId_fkey" FOREIGN KEY ("quizSessionId") REFERENCES "quiz_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt" ADD CONSTRAINT "quiz_attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answer" ADD CONSTRAINT "quiz_attempt_answer_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "quiz_attempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempt_answer" ADD CONSTRAINT "quiz_attempt_answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
