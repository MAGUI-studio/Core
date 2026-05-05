-- AlterTable
ALTER TABLE "MaguiConnectProfile" ADD COLUMN     "animation" TEXT DEFAULT 'none',
ADD COLUMN     "buttonStyle" TEXT DEFAULT 'rounded',
ADD COLUMN     "fontFamily" TEXT DEFAULT 'sans',
ADD COLUMN     "whatsappMessage" TEXT;

-- AlterTable
ALTER TABLE "MaguiConnectSection" ADD COLUMN     "isCollapsible" BOOLEAN NOT NULL DEFAULT false;
