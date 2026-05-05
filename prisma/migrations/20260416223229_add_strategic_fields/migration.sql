-- CreateEnum
CREATE TYPE "ProjectCategory" AS ENUM ('WEB_APP', 'MOBILE_APP', 'BRANDING', 'LANDING_PAGE', 'E_COMMERCE', 'UI_UX_DESIGN');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "category" "ProjectCategory" NOT NULL DEFAULT 'WEB_APP',
ADD COLUMN     "liveUrl" TEXT,
ADD COLUMN     "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "repositoryUrl" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Update" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "taxId" TEXT;
