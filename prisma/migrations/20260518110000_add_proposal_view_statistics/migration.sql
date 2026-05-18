ALTER TABLE "Proposal"
ADD COLUMN "firstViewedAt" TIMESTAMP(3),
ADD COLUMN "lastViewedAt" TIMESTAMP(3),
ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "ProposalViewEvent" (
    "id" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProposalViewEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProposalViewEvent_proposalId_viewedAt_idx" ON "ProposalViewEvent"("proposalId", "viewedAt");

ALTER TABLE "ProposalViewEvent"
ADD CONSTRAINT "ProposalViewEvent_proposalId_fkey"
FOREIGN KEY ("proposalId") REFERENCES "Proposal"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
