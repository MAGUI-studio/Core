-- CreateTable
CREATE TABLE "SearchDocument" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "body" TEXT,
    "metadata" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchDocument_entityType_entityId_idx" ON "SearchDocument"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "SearchDocument_projectId_idx" ON "SearchDocument"("projectId");
