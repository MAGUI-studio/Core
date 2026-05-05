-- CreateEnum
CREATE TYPE "ThreadStatus" AS ENUM ('OPEN', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('INFORMATIVE', 'REQUIRES_RESPONSE', 'REQUIRES_APPROVAL', 'REQUIRES_ASSET', 'FINANCIAL', 'LEGAL', 'CALL_SUMMARY');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'NEW_THREAD';
ALTER TYPE "NotificationType" ADD VALUE 'NEW_MESSAGE';
ALTER TYPE "NotificationType" ADD VALUE 'DECISION_REGISTERED';
ALTER TYPE "NotificationType" ADD VALUE 'THREAD_RESOLVED';

-- AlterTable
ALTER TABLE "Proposal" ADD COLUMN     "acceptedAt" TIMESTAMP(3),
ADD COLUMN     "acceptedIp" TEXT;

-- CreateTable
CREATE TABLE "Thread" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "title" TEXT,
    "status" "ThreadStatus" NOT NULL DEFAULT 'OPEN',
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'INFORMATIVE',
    "authorId" TEXT,
    "threadId" TEXT NOT NULL,
    "attachments" JSONB DEFAULT '[]',
    "requiresResponse" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "decision" TEXT NOT NULL,
    "impactScope" TEXT,
    "impactDeadline" TEXT,
    "impactFinancial" TEXT,
    "threadId" TEXT,
    "projectId" TEXT NOT NULL,
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalBlock" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProposalBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Thread_entityType_entityId_idx" ON "Thread"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Thread_projectId_status_idx" ON "Thread"("projectId", "status");

-- CreateIndex
CREATE INDEX "Message_threadId_createdAt_idx" ON "Message"("threadId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_authorId_idx" ON "Message"("authorId");

-- CreateIndex
CREATE INDEX "Message_requiresResponse_resolvedAt_idx" ON "Message"("requiresResponse", "resolvedAt");

-- CreateIndex
CREATE INDEX "Decision_projectId_decidedAt_idx" ON "Decision"("projectId", "decidedAt");

-- CreateIndex
CREATE INDEX "Decision_threadId_idx" ON "Decision"("threadId");

-- CreateIndex
CREATE INDEX "ProposalBlock_category_idx" ON "ProposalBlock"("category");

-- AddForeignKey
ALTER TABLE "Thread" ADD CONSTRAINT "Thread_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "Thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
