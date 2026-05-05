-- CreateTable
CREATE TABLE "ProjectHandoff" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "proposalId" TEXT,
    "proposalTitle" TEXT,
    "finalValue" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'BRL',
    "soldItems" JSONB DEFAULT '[]',
    "commercialNotes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "ownerId" TEXT,
    "handoffNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectHandoff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectKickoffChecklist" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "contractSigned" BOOLEAN NOT NULL DEFAULT false,
    "briefingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "brandAssetsSent" BOOLEAN NOT NULL DEFAULT false,
    "accessReceived" BOOLEAN NOT NULL DEFAULT false,
    "firstMeetingDone" BOOLEAN NOT NULL DEFAULT false,
    "items" JSONB DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectKickoffChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectHandoff_projectId_key" ON "ProjectHandoff"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectHandoff_proposalId_key" ON "ProjectHandoff"("proposalId");

-- CreateIndex
CREATE INDEX "ProjectHandoff_projectId_idx" ON "ProjectHandoff"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectKickoffChecklist_projectId_key" ON "ProjectKickoffChecklist"("projectId");

-- AddForeignKey
ALTER TABLE "ProjectHandoff" ADD CONSTRAINT "ProjectHandoff_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectHandoff" ADD CONSTRAINT "ProjectHandoff_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectKickoffChecklist" ADD CONSTRAINT "ProjectKickoffChecklist_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
