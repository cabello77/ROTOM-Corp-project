-- Migration: Update Club and ClubMember fields to match schema
-- This migration updates the database to match the Prisma schema

-- Step 1: Rename 'progress' to 'pageNumber' in ClubMember and make it nullable
-- First, add the new pageNumber column (nullable)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ClubMember' AND column_name = 'pageNumber'
  ) THEN
    ALTER TABLE "ClubMember" ADD COLUMN "pageNumber" INTEGER;
  END IF;
END $$;

-- Copy existing progress values to pageNumber (only if progress column exists)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ClubMember' AND column_name = 'progress'
  ) THEN
    UPDATE "ClubMember" 
    SET "pageNumber" = "progress" 
    WHERE "progress" IS NOT NULL;
  END IF;
END $$;

-- Drop the old progress column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'ClubMember' AND column_name = 'progress'
  ) THEN
    ALTER TABLE "ClubMember" DROP COLUMN "progress";
  END IF;
END $$;

-- Step 2: Add readingGoalPageStart and readingGoalPageEnd to Club table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Club' AND column_name = 'readingGoalPageStart'
  ) THEN
    ALTER TABLE "Club" ADD COLUMN "readingGoalPageStart" INTEGER;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Club' AND column_name = 'readingGoalPageEnd'
  ) THEN
    ALTER TABLE "Club" ADD COLUMN "readingGoalPageEnd" INTEGER;
  END IF;
END $$;

-- Step 3: Change goalDeadline from TIMESTAMP to TEXT
-- First, create a temporary column with TEXT type
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Club' AND column_name = 'goalDeadline_temp'
  ) THEN
    ALTER TABLE "Club" ADD COLUMN "goalDeadline_temp" TEXT;
  END IF;
END $$;

-- Copy existing TIMESTAMP values to TEXT format (if any exist)
-- Convert TIMESTAMP to ISO 8601 string format
UPDATE "Club" 
SET "goalDeadline_temp" = TO_CHAR("goalDeadline", 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
WHERE "goalDeadline" IS NOT NULL;

-- Drop the old TIMESTAMP column
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Club' AND column_name = 'goalDeadline' 
    AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE "Club" DROP COLUMN "goalDeadline";
  END IF;
END $$;

-- Rename the temp column to goalDeadline
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'Club' AND column_name = 'goalDeadline_temp'
  ) THEN
    ALTER TABLE "Club" RENAME COLUMN "goalDeadline_temp" TO "goalDeadline";
  END IF;
END $$;

