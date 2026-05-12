import Stripe from "stripe"

import { env } from "@/src/config/env"

let stripeClient: Stripe | null = null

export function getStripe() {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not defined in environment variables")
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-04-22.dahlia",
      typescript: true,
    })
  }

  return stripeClient
}
