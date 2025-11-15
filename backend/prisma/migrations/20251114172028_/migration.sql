/*
  Warnings:

  - Made the column `convoId` on table `DMMessage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DMMessage" ALTER COLUMN "convoId" SET NOT NULL;
