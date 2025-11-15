-- CreateEnum
CREATE TYPE "FriendStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "Friend" (
    "id" SERIAL NOT NULL,
    "userID" INTEGER NOT NULL,
    "friendID" INTEGER NOT NULL,
    "status" "FriendStatus" NOT NULL,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionPostVote" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "discussionId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "DiscussionPostVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscussionReplyVote" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "replyId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,

    CONSTRAINT "DiscussionReplyVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userID_friendID_key" ON "Friend"("userID", "friendID");

-- CreateIndex
CREATE INDEX "DiscussionPostVote_discussionId_idx" ON "DiscussionPostVote"("discussionId");

-- CreateIndex
CREATE INDEX "DiscussionPostVote_userId_idx" ON "DiscussionPostVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscussionPostVote_userId_discussionId_key" ON "DiscussionPostVote"("userId", "discussionId");

-- CreateIndex
CREATE INDEX "DiscussionReplyVote_replyId_idx" ON "DiscussionReplyVote"("replyId");

-- CreateIndex
CREATE INDEX "DiscussionReplyVote_userId_idx" ON "DiscussionReplyVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscussionReplyVote_userId_replyId_key" ON "DiscussionReplyVote"("userId", "replyId");

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friendID_fkey" FOREIGN KEY ("friendID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionPostVote" ADD CONSTRAINT "DiscussionPostVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionPostVote" ADD CONSTRAINT "DiscussionPostVote_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "DiscussionPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionReplyVote" ADD CONSTRAINT "DiscussionReplyVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscussionReplyVote" ADD CONSTRAINT "DiscussionReplyVote_replyId_fkey" FOREIGN KEY ("replyId") REFERENCES "DiscussionReply"("id") ON DELETE CASCADE ON UPDATE CASCADE;
