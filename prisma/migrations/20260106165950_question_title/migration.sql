/*
  Warnings:

  - Added the required column `question` to the `question` table without a default value. This is not possible if the table is not empty.
  - Made the column `difficulty` on table `question` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "question" ADD COLUMN     "question" TEXT NOT NULL,
ALTER COLUMN "difficulty" SET NOT NULL;
