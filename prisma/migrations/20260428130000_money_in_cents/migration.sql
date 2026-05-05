-- Store monetary values as integer cents to avoid float rounding issues.
-- This project uses development resets; this migration still attempts a safe conversion.

-- ServiceCategory
ALTER TABLE "ServiceCategory"
  DROP COLUMN IF EXISTS "thirdPartyCosts";

ALTER TABLE "ServiceCategory"
  ALTER COLUMN "suggestedValue" TYPE INTEGER
  USING ROUND("suggestedValue" * 100)::INTEGER;

-- Project
ALTER TABLE "Project"
  ALTER COLUMN "budget" TYPE INTEGER
  USING CASE
    WHEN "budget" IS NULL THEN NULL
    ELSE ROUND("budget" * 100)::INTEGER
  END;

-- Proposal
ALTER TABLE "Proposal"
  ALTER COLUMN "totalValue" TYPE INTEGER
  USING ROUND("totalValue" * 100)::INTEGER;

-- ProposalItem
ALTER TABLE "ProposalItem"
  ALTER COLUMN "unitValue" TYPE INTEGER
  USING ROUND("unitValue" * 100)::INTEGER;

-- Invoice
ALTER TABLE "Invoice"
  ALTER COLUMN "totalAmount" TYPE INTEGER
  USING ROUND("totalAmount" * 100)::INTEGER;

-- Installment
ALTER TABLE "Installment"
  ALTER COLUMN "amount" TYPE INTEGER
  USING ROUND("amount" * 100)::INTEGER;

-- PaymentEvent
ALTER TABLE "PaymentEvent"
  ALTER COLUMN "amount" TYPE INTEGER
  USING ROUND("amount" * 100)::INTEGER;

