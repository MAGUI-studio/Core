-- CreateEnum
CREATE TYPE "ProjectMemberRole" AS ENUM ('OWNER', 'COLLABORATOR');

-- CreateTable
CREATE TABLE "ProjectMember" (
    "id" TEXT NOT NULL,
    "role" "ProjectMemberRole" NOT NULL DEFAULT 'COLLABORATOR',
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- Backfill current project owners as explicit members.
INSERT INTO "ProjectMember" ("id", "role", "projectId", "userId", "createdAt", "updatedAt")
SELECT
    CONCAT('pm_', md5(CONCAT("id", ':', "clientId"))),
    'OWNER'::"ProjectMemberRole",
    "id",
    "clientId",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Project"
ON CONFLICT DO NOTHING;

-- CreateIndex
CREATE UNIQUE INDEX "ProjectMember_projectId_userId_key" ON "ProjectMember"("projectId", "userId");

-- CreateIndex
CREATE INDEX "ProjectMember_userId_idx" ON "ProjectMember"("userId");

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_role_idx" ON "ProjectMember"("projectId", "role");

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
