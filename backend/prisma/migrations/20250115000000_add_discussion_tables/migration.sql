-- CreateTable
CREATE TABLE IF NOT EXISTS "DiscussionPostContent" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,

    CONSTRAINT "DiscussionPostContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DiscussionPost" (
    "id" SERIAL NOT NULL,
    "datePosted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateEdited" TIMESTAMP(3),
    "hasMedia" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "chapterIndex" INTEGER,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "tags" JSONB,
    "clubId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "contentId" INTEGER NOT NULL,

    CONSTRAINT "DiscussionPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DiscussionPostMedia" (
    "id" SERIAL NOT NULL,
    "file" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "discussionId" INTEGER NOT NULL,

    CONSTRAINT "DiscussionPostMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DiscussionReply" (
    "id" SERIAL NOT NULL,
    "discussionId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "userId" INTEGER NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiscussionReply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "DiscussionPost_contentId_key" ON "DiscussionPost"("contentId");

-- AddForeignKey (using IF NOT EXISTS pattern for PostgreSQL)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DiscussionPost_clubId_fkey'
    ) THEN
        ALTER TABLE "DiscussionPost" ADD CONSTRAINT "DiscussionPost_clubId_fkey" 
            FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DiscussionPost_userId_fkey'
    ) THEN
        ALTER TABLE "DiscussionPost" ADD CONSTRAINT "DiscussionPost_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DiscussionPost_contentId_fkey'
    ) THEN
        ALTER TABLE "DiscussionPost" ADD CONSTRAINT "DiscussionPost_contentId_fkey" 
            FOREIGN KEY ("contentId") REFERENCES "DiscussionPostContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DiscussionPostMedia_discussionId_fkey'
    ) THEN
        ALTER TABLE "DiscussionPostMedia" ADD CONSTRAINT "DiscussionPostMedia_discussionId_fkey" 
            FOREIGN KEY ("discussionId") REFERENCES "DiscussionPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DiscussionReply_discussionId_fkey'
    ) THEN
        ALTER TABLE "DiscussionReply" ADD CONSTRAINT "DiscussionReply_discussionId_fkey" 
            FOREIGN KEY ("discussionId") REFERENCES "DiscussionPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DiscussionReply_userId_fkey'
    ) THEN
        ALTER TABLE "DiscussionReply" ADD CONSTRAINT "DiscussionReply_userId_fkey" 
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'DiscussionReply_parentId_fkey'
    ) THEN
        ALTER TABLE "DiscussionReply" ADD CONSTRAINT "DiscussionReply_parentId_fkey" 
            FOREIGN KEY ("parentId") REFERENCES "DiscussionReply"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

