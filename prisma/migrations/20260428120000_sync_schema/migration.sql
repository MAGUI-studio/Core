-- This migration was generated manually via `prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script`
-- because `prisma migrate dev` is not supported in this non-interactive environment.

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('FIFTY_FIFTY', 'MONTHLY_INSTALLMENTS');

-- AlterEnum
BEGIN;
CREATE TYPE "ProjectCategory_new" AS ENUM ('LANDING_PAGE', 'INSTITUTIONAL_SITE', 'BOOKING_PLATFORM', 'STABILITY_PLAN');
ALTER TABLE "public"."Project" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "Project" ALTER COLUMN "category" TYPE "ProjectCategory_new" USING ("category"::text::"ProjectCategory_new");
ALTER TYPE "ProjectCategory" RENAME TO "ProjectCategory_old";
ALTER TYPE "ProjectCategory_new" RENAME TO "ProjectCategory";
DROP TYPE "public"."ProjectCategory_old";
ALTER TABLE "Project" ALTER COLUMN "category" SET DEFAULT 'LANDING_PAGE';
COMMIT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "priority",
ADD COLUMN     "customValue" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'FIFTY_FIFTY',
ADD COLUMN     "serviceCategoryId" TEXT,
DROP COLUMN "budget",
ADD COLUMN     "budget" DOUBLE PRECISION,
ALTER COLUMN "category" SET DEFAULT 'LANDING_PAGE';

-- DropEnum
DROP TYPE "Priority";

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "approach" TEXT NOT NULL,
    "suggestedValue" DOUBLE PRECISION NOT NULL,
    "thirdPartyCosts" TEXT,
    "imageUrl" TEXT,
    "isSubscription" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_serviceCategoryId_idx" ON "Project"("serviceCategoryId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_serviceCategoryId_fkey" FOREIGN KEY ("serviceCategoryId") REFERENCES "ServiceCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

