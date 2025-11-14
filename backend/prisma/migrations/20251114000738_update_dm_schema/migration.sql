/*
  Warnings:

  - You are about to drop the column `convoId` on the `DMMessage` table. All the data in the column will be lost.
  - Added the required column `conversationId` to the `DMMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverId` to the `DMMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."DMMessage" DROP CONSTRAINT "DMMessage_convoId_fkey";

-- AlterTable
ALTER TABLE "DMMessage" DROP COLUMN "convoId",
ADD COLUMN     "conversationId" INTEGER NOT NULL,
ADD COLUMN     "receiverId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "DMMessage" ADD CONSTRAINT "DMMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "DirectMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DMMessage" ADD CONSTRAINT "DMMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
