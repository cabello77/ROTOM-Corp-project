/*
  Warnings:

  - Added the required column `role` to the `ClubMember` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HOST', 'MODERATOR', 'MEMBER');

-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "assignedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ClubMember" ADD COLUMN     "role" "Role" NOT NULL;

-- CreateTable
CREATE TABLE "ClubBookHistory" (
    "id" SERIAL NOT NULL,
    "clubId" INTEGER NOT NULL,
    "bookId" TEXT NOT NULL,
    "bookData" JSONB NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "ClubBookHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClubBookHistory" ADD CONSTRAINT "ClubBookHistory_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
