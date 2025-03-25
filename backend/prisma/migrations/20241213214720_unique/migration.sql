/*
  Warnings:

  - A unique constraint covering the columns `[projectId,language]` on the table `Code` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Code_projectId_language_key" ON "Code"("projectId", "language");
