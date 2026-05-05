-- AlterTable
ALTER TABLE "MaguiConnectLink" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "startsAt" TIMESTAMP(3);
