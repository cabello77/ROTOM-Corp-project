/*
  Warnings:

  - You are about to drop the column `conversationId` on the `DMMessage` table. All the data in the column will be lost.
  - The primary key for the `DirectMessage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `convoId` to the `DMMessage` table without a default value. This is not possible if the table is not empty.
*/

-- Step 1: Drop foreign keys
ALTER TABLE "DMMessage" DROP CONSTRAINT IF EXISTS "DMMessage_conversationId_fkey";
ALTER TABLE "DMMessage" DROP CONSTRAINT IF EXISTS "DMMessage_receiverId_fkey";
ALTER TABLE "DMMessage" DROP CONSTRAINT IF EXISTS "DMMessage_senderId_fkey";

-- Step 2: Create a temporary column to store the old IDs as text
ALTER TABLE "DirectMessage" ADD COLUMN "tempId" TEXT;
UPDATE "DirectMessage" SET "tempId" = CAST("id" AS TEXT);

-- Step 3: Update DMMessage to use text IDs temporarily
ALTER TABLE "DMMessage" ADD COLUMN "convoId" TEXT;
UPDATE "DMMessage" SET "convoId" = CAST("conversationId" AS TEXT);

-- Step 4: Drop the old conversationId column
ALTER TABLE "DMMessage" DROP COLUMN "conversationId";

-- Step 5: Change DirectMessage id to TEXT and use cuid format
ALTER TABLE "DirectMessage" DROP CONSTRAINT "DirectMessage_pkey";
ALTER TABLE "DirectMessage" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "DirectMessage" ALTER COLUMN "id" SET DATA TYPE TEXT USING "tempId";
DROP SEQUENCE IF EXISTS "DirectMessage_id_seq";

-- Step 6: Generate new cuid-style IDs for existing records
UPDATE "DirectMessage" SET "id" = 'dm_' || "user1Id" || '_' || "user2Id";
UPDATE "DMMessage" SET "convoId" = 'dm_' || (
  SELECT "user1Id" || '_' || "user2Id" 
  FROM "DirectMessage" 
  WHERE CAST("DirectMessage"."tempId" AS TEXT) = "DMMessage"."convoId"
  LIMIT 1
);

-- Step 7: Clean up temp column
ALTER TABLE "DirectMessage" DROP COLUMN "tempId";

-- Step 8: Add updatedAt with default
ALTER TABLE "DirectMessage" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Step 9: Re-add primary key
ALTER TABLE "DirectMessage" ADD CONSTRAINT "DirectMessage_pkey" PRIMARY KEY ("id");

-- Step 10: Create indexes
CREATE INDEX IF NOT EXISTS "DMMessage_convoId_idx" ON "DMMessage"("convoId");
CREATE INDEX IF NOT EXISTS "DMMessage_senderId_idx" ON "DMMessage"("senderId");
CREATE INDEX IF NOT EXISTS "DMMessage_receiverId_idx" ON "DMMessage"("receiverId");
CREATE INDEX IF NOT EXISTS "DirectMessage_user1Id_idx" ON "DirectMessage"("user1Id");
CREATE INDEX IF NOT EXISTS "DirectMessage_user2Id_idx" ON "DirectMessage"("user2Id");

-- Step 11: Re-add foreign keys
ALTER TABLE "DMMessage" ADD CONSTRAINT "DMMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DMMessage" ADD CONSTRAINT "DMMessage_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DMMessage" ADD CONSTRAINT "DMMessage_convoId_fkey" FOREIGN KEY ("convoId") REFERENCES "DirectMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;