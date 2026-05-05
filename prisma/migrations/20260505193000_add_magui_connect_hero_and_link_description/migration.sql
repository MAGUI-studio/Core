ALTER TABLE "MaguiConnectProfile"
ADD COLUMN "heroKicker" TEXT,
ADD COLUMN "heroHeadline" TEXT,
ADD COLUMN "heroDescription" TEXT,
ADD COLUMN "secondaryCtaLabel" TEXT,
ADD COLUMN "secondaryCtaUrl" TEXT;

ALTER TABLE "MaguiConnectLink"
ADD COLUMN "customShortDescription" TEXT;
