-- CreateEnum
CREATE TYPE "State" AS ENUM ('PENDING', 'JOINED', 'REJECTED');

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "StudentId" TEXT NOT NULL,
    "TeacherId" TEXT,
    "state" "State" NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Request_classId_StudentId_key" ON "Request"("classId", "StudentId");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_StudentId_fkey" FOREIGN KEY ("StudentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_TeacherId_fkey" FOREIGN KEY ("TeacherId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
