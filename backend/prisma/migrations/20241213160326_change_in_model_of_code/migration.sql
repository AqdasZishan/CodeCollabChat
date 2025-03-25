/*
  Warnings:

  - You are about to drop the column `data` on the `project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LanguageCode" AS ENUM ('JS', 'JAVA', 'PYTHON');

-- AlterTable
ALTER TABLE "project" DROP COLUMN "data";

-- CreateTable
CREATE TABLE "Code" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "language" "LanguageCode" NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "Code_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Code" ADD CONSTRAINT "Code_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
