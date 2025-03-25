/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Class` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "project_classId_key";

-- DropIndex
DROP INDEX "project_userId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Class_name_key" ON "Class"("name");
