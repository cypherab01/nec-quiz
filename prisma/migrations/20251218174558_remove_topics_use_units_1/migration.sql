/*
  Warnings:

  - You are about to drop the column `topicId` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `topicCode` on the `quiz_session` table. All the data in the column will be lost.
  - You are about to drop the `topic` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `unitId` to the `question` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "question" DROP CONSTRAINT "question_topicId_fkey";

-- DropForeignKey
ALTER TABLE "topic" DROP CONSTRAINT "topic_unitId_fkey";

-- DropIndex
DROP INDEX "question_topicId_idx";

-- AlterTable
ALTER TABLE "question" DROP COLUMN "topicId",
ADD COLUMN     "unitId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "quiz_session" DROP COLUMN "topicCode";

-- DropTable
DROP TABLE "topic";

-- CreateIndex
CREATE INDEX "question_unitId_idx" ON "question"("unitId");

-- AddForeignKey
ALTER TABLE "question" ADD CONSTRAINT "question_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
