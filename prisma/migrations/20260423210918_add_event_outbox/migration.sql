-- CreateTable
CREATE TABLE "EventOutbox" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventOutbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventOutbox_status_createdAt_idx" ON "EventOutbox"("status", "createdAt");
