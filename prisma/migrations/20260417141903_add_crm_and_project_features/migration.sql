/*
  Warnings:

  - You are about to drop the column `timezone` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `Update` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('GARIMPAGEM', 'CONTATO_REALIZADO', 'NEGOCIACAO', 'CONVERTIDO', 'DESCARTADO');

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "timezone";

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "briefing" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "Update" DROP COLUMN "timezone",
ADD COLUMN     "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "requiresApproval" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'GARIMPAGEM',
    "notes" TEXT,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActionItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "ActionStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3),
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Version" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deployUrl" TEXT,
    "description" TEXT,
    "scorePerformance" INTEGER,
    "scoreAccessibility" INTEGER,
    "scoreBestPractices" INTEGER,
    "scoreSEO" INTEGER,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Version_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActionItem" ADD CONSTRAINT "ActionItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Version" ADD CONSTRAINT "Version_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
