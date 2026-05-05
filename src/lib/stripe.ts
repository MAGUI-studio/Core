import Stripe from "stripe"

import { env } from "@/src/config/env"

if (!env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables")
}

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
})
