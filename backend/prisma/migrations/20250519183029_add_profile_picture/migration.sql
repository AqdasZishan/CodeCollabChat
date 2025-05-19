-- AlterTable
ALTER TABLE "_Student" ADD CONSTRAINT "_Student_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_Student_AB_unique";
