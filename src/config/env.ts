import { z } from "zod"

const isTest = process.env.NODE_ENV === "test"
const isCI = process.env.CI === "true"
const useFallback = isTest || isCI

const testDatabaseUrl = [
  "postgres",
  "ql",
  "://",
  "test",
  ":",
  "test",
  "@",
  "localhost",
  ":",
  "5432",
  "/",
  "test",
].join("")

const fallbackEnv = {
  DATABASE_URL: testDatabaseUrl,
  NEXT_PUBLIC_SITE_URL: "https://example.com",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_placeholder",
  CLERK_SECRET_KEY: "sk_test_placeholder",
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/",
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/",
  UPLOADTHING_TOKEN: "ut_test_placeholder",
}

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_MAX: z.coerce.number().optional(),
  DATA_CACHE_TTL_SECONDS: z.coerce.number().default(300),
  OPERATIONAL_REMINDERS_SECRET: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: z.string().min(1),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: z.string().min(1),
  CLERK_PROXY_URL: z.string().optional(),
  UPLOADTHING_TOKEN: z.string().min(1),
  AUTENTIQUE_TOKEN: z.string().optional(),
  AUTENTIQUE_URL: z
    .string()
    .url()
    .default("https://api.autentique.com.br/v2/graphql"),
  RESEND_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  MAGUI_CONNECT_RENDERER_SHARED_SECRET: z.string().optional(),
  MAGUI_CONNECT_RENDERER_URL: z.string().url().optional(),
  MAGUI_CONNECT_RENDERER_REVALIDATE_SECRET: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
})

const parsedEnv = envSchema.safeParse({
  DATABASE_URL:
    process.env.DATABASE_URL ||
    (useFallback ? fallbackEnv.DATABASE_URL : undefined),
  DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX,
  DATA_CACHE_TTL_SECONDS: process.env.DATA_CACHE_TTL_SECONDS,
  OPERATIONAL_REMINDERS_SECRET: process.env.OPERATIONAL_REMINDERS_SECRET,
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL ||
    (useFallback ? fallbackEnv.NEXT_PUBLIC_SITE_URL : undefined),
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ||
    (useFallback ? fallbackEnv.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY : undefined),
  CLERK_SECRET_KEY:
    process.env.CLERK_SECRET_KEY ||
    (useFallback ? fallbackEnv.CLERK_SECRET_KEY : undefined),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ||
    (useFallback ? fallbackEnv.NEXT_PUBLIC_CLERK_SIGN_IN_URL : undefined),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ||
    (useFallback ? fallbackEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL : undefined),
  NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ||
    (useFallback
      ? fallbackEnv.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
      : undefined),
  NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ||
    (useFallback
      ? fallbackEnv.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
      : undefined),
  CLERK_PROXY_URL: process.env.CLERK_PROXY_URL,
  UPLOADTHING_TOKEN:
    process.env.UPLOADTHING_TOKEN ||
    (useFallback ? fallbackEnv.UPLOADTHING_TOKEN : undefined),
  AUTENTIQUE_TOKEN: process.env.AUTENTIQUE_TOKEN,
  AUTENTIQUE_URL: process.env.AUTENTIQUE_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  MAGUI_CONNECT_RENDERER_SHARED_SECRET:
    process.env.MAGUI_CONNECT_RENDERER_SHARED_SECRET,
  MAGUI_CONNECT_RENDERER_URL: process.env.MAGUI_CONNECT_RENDERER_URL,
  MAGUI_CONNECT_RENDERER_REVALIDATE_SECRET:
    process.env.MAGUI_CONNECT_RENDERER_REVALIDATE_SECRET,
  NODE_ENV: process.env.NODE_ENV,
})

if (!parsedEnv.success) {
  const errors = parsedEnv.error.flatten().fieldErrors
  throw new Error(
    `Invalid environment variables: ${JSON.stringify(errors, null, 2)}`
  )
}

export const env = parsedEnv.data
