CREATE TYPE "MaguiConnectEntityType" AS ENUM ('PERSON', 'ORGANIZATION', 'BRAND');

ALTER TABLE "MaguiConnectProfile"
ADD COLUMN "siteName" TEXT,
ADD COLUMN "faviconUrl" TEXT,
ADD COLUMN "logoUrl" TEXT,
ADD COLUMN "twitterImageUrl" TEXT,
ADD COLUMN "canonicalUrl" TEXT,
ADD COLUMN "locale" TEXT NOT NULL DEFAULT 'pt-BR',
ADD COLUMN "entityType" "MaguiConnectEntityType" NOT NULL DEFAULT 'PERSON',
ADD COLUMN "jobTitle" TEXT,
ADD COLUMN "themeColor" TEXT,
ADD COLUMN "seoKeywords" TEXT,
ADD COLUMN "twitterHandle" TEXT,
ADD COLUMN "indexable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "seoNoFollow" BOOLEAN NOT NULL DEFAULT false;

UPDATE "MaguiConnectProfile"
SET
  "siteName" = COALESCE(NULLIF(TRIM("displayName"), ''), "siteName"),
  "seoTitle" = COALESCE(NULLIF(TRIM("seoTitle"), ''), NULLIF(TRIM("displayName"), '')),
  "seoDescription" = COALESCE(
    NULLIF(TRIM("seoDescription"), ''),
    NULLIF(TRIM("headline"), ''),
    NULLIF(TRIM("bio"), '')
  ),
  "locale" = COALESCE(NULLIF(TRIM("locale"), ''), 'pt-BR'),
  "indexable" = true,
  "seoNoFollow" = false,
  "ogImageUrl" = COALESCE(
    NULLIF(TRIM("ogImageUrl"), ''),
    NULLIF(TRIM("bannerUrl"), ''),
    NULLIF(TRIM("avatarUrl"), '')
  ),
  "twitterImageUrl" = COALESCE(
    NULLIF(TRIM("twitterImageUrl"), ''),
    NULLIF(TRIM("ogImageUrl"), ''),
    NULLIF(TRIM("bannerUrl"), ''),
    NULLIF(TRIM("avatarUrl"), '')
  ),
  "entityType" = 'PERSON';
