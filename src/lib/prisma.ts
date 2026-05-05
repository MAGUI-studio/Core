import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

import { logger } from "@/src/lib/logger"

import { env } from "@/src/config/env"

import { PrismaClient } from "../generated/client"

function normalizeConnectionString(value: string): string {
  if (!value.includes("sslmode=")) {
    return value
  }

  return value.replace(
    /sslmode=(prefer|require|verify-ca)\b/g,
    "sslmode=verify-full"
  )
}

const connectionString = normalizeConnectionString(env.DATABASE_URL)

const isExternalDb =
  connectionString.includes("neon.tech") ||
  connectionString.includes("supabase.co") ||
  connectionString.includes("db.prisma.io")

const shouldUseSsl =
  isExternalDb ||
  connectionString.includes("sslmode=require") ||
  connectionString.includes("sslmode=verify-full")

declare global {
  var pgPool: pg.Pool | undefined
  var prismaAdapter: PrismaPg | undefined
  var prisma: PrismaClient | undefined
}

function createPool(): pg.Pool {
  logger.info(
    { connectionString: connectionString.split("@")[1] || "local" },
    "Creating new database pool"
  )

  const pool = new pg.Pool({
    connectionString,
    ssl: shouldUseSsl
      ? {
          rejectUnauthorized: false,
        }
      : undefined,
    max: isExternalDb ? 4 : 10,
    idleTimeoutMillis: isExternalDb ? 30000 : 10000,
    connectionTimeoutMillis: isExternalDb ? 15000 : 5000,
    // keepAlive: true, // Removed as it can cause "Server has closed the connection" on some infrastructures
  })

  pool.on("error", (err: Error) => {
    logger.error({ err }, "Unexpected error on idle database client")
  })

  pool.on("connect", () => {
    logger.debug("New database client connected to pool")
  })

  return pool
}

function getPool(): pg.Pool {
  if (!globalThis.pgPool) {
    globalThis.pgPool = createPool()
  }

  return globalThis.pgPool
}

function getAdapter(): PrismaPg {
  if (!globalThis.prismaAdapter) {
    globalThis.prismaAdapter = new PrismaPg(getPool())
  }

  return globalThis.prismaAdapter
}

function prismaClientSingleton(): PrismaClient {
  return new PrismaClient({ adapter: getAdapter() })
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}
