/*
  Warnings:

  - You are about to drop the column `avatar` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `bio` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `club_members` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `clubs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comments` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `threads` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."club_members" DROP CONSTRAINT "club_members_clubId_fkey";

-- DropForeignKey
ALTER TABLE "public"."club_members" DROP CONSTRAINT "club_members_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_threadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."messages" DROP CONSTRAINT "messages_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."posts" DROP CONSTRAINT "posts_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."threads" DROP CONSTRAINT "threads_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."threads" DROP CONSTRAINT "threads_clubId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "avatar",
DROP COLUMN "bio",
DROP COLUMN "createdAt",
DROP COLUMN "password",
DROP COLUMN "updatedAt";

-- DropTable
DROP TABLE "public"."club_members";

-- DropTable
DROP TABLE "public"."clubs";

-- DropTable
DROP TABLE "public"."comments";

-- DropTable
DROP TABLE "public"."messages";

-- DropTable
DROP TABLE "public"."posts";

-- DropTable
DROP TABLE "public"."threads";
