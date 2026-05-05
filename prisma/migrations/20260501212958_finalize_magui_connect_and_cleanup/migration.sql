/*
  Warnings:

  - The values [NEW_THREAD,NEW_MESSAGE,DECISION_REGISTERED,THREAD_RESOLVED] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `slug` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `Decision` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MessageReaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Thread` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('UPDATE_PENDING_APPROVAL', 'UPDATE_PUBLISHED', 'UPDATE_APPROVED', 'UPDATE_REJECTED', 'BRIEFING_SUBMITTED', 'ASSET_UPLOADED', 'PROJECT_STATUS_CHANGED', 'LEAD_ASSIGNED', 'OPERATIONAL_REMINDER');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "public"."NotificationType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Decision" DROP CONSTRAINT "Decision_decidedById_fkey";

-- DropForeignKey
ALTER TABLE "Decision" DROP CONSTRAINT "Decision_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Decision" DROP CONSTRAINT "Decision_threadId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_replyToId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_resolvedById_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_threadId_fkey";

-- DropForeignKey
ALTER TABLE "MessageReaction" DROP CONSTRAINT "MessageReaction_messageId_fkey";

-- DropForeignKey
ALTER TABLE "MessageReaction" DROP CONSTRAINT "MessageReaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "Thread" DROP CONSTRAINT "Thread_projectId_fkey";

-- DropIndex
DROP INDEX "Lead_slug_key";

-- DropIndex
DROP INDEX "Project_slug_key";

-- AlterTable
ALTER TABLE "Lead" DROP COLUMN "slug";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "slug";

-- DropTable
DROP TABLE "Decision";

-- DropTable
DROP TABLE "Message";

-- DropTable
DROP TABLE "MessageReaction";

-- DropTable
DROP TABLE "Thread";

-- DropEnum
DROP TYPE "MessageType";

-- DropEnum
DROP TYPE "ThreadStatus";
