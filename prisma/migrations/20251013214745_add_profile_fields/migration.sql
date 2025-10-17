-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "bookClubs" JSONB,
ADD COLUMN     "friends" INTEGER DEFAULT 0,
ADD COLUMN     "joinDate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "readingProgress" JSONB;
