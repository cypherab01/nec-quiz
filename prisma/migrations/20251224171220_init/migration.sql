/*
  Warnings:

  - You are about to drop the column `isActive` on the `question` table. All the data in the column will be lost.
  - You are about to drop the column `references` on the `question` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "question" DROP COLUMN "isActive",
DROP COLUMN "references";
