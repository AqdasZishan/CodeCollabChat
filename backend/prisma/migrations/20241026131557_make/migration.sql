/*
  Warnings:

  - Made the column `TeacherId` on table `Request` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_TeacherId_fkey";

-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "TeacherId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_TeacherId_fkey" FOREIGN KEY ("TeacherId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
