-- CreateEnum
CREATE TYPE "InvoiceKind" AS ENUM ('PROJECT', 'MAGUI_CONNECT', 'OTHER');

-- AlterTable
ALTER TABLE "Invoice"
ADD COLUMN "clientId" TEXT,
ADD COLUMN "kind" "InvoiceKind" NOT NULL DEFAULT 'PROJECT';

-- Backfill clientId from related projects
UPDATE "Invoice" AS i
SET "clientId" = p."clientId"
FROM "Project" AS p
WHERE i."projectId" = p."id"
  AND i."clientId" IS NULL;

-- CreateIndex
CREATE INDEX "Invoice_clientId_idx" ON "Invoice"("clientId");

-- CreateIndex
CREATE INDEX "Invoice_kind_idx" ON "Invoice"("kind");

-- AddForeignKey
ALTER TABLE "Invoice"
ADD CONSTRAINT "Invoice_clientId_fkey"
FOREIGN KEY ("clientId") REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
