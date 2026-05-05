import { env } from "./env"

/**
 * Cache TTL configurations in seconds.
 *
 * Hierarchy:
 * 1. CRITICAL: 30-60s (Dashboard, Notifications)
 * 2. STANDARD: 60-300s (Project details, Client details)
 * 3. PERSISTENT: 300-900s (Templates, User Preferences, Global options)
 */

const baseTtl = env.DATA_CACHE_TTL_SECONDS

export const CACHE_TTL = {
  // critical data that changes often
  DASHBOARD: 60,
  NOTIFICATIONS: 30,
  ACTIVITY_FEED: 30,

  // standard operational data
  PROJECT_DETAILS: baseTtl,
  CLIENT_DETAILS: baseTtl,
  PROJECT_ROWS: baseTtl,
  CLIENT_ROWS: baseTtl,
  LEADS: baseTtl,

  // persistent or static data
  TEMPLATES: 600,
  USER_PREFERENCES: 900,
  CLIENT_OPTIONS: 600,
  SEARCH_RESULTS: 120,
} as const
