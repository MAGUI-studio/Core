import { AsyncLocalStorage } from "node:async_hooks"

import { logger } from "@/src/lib/logger"

interface QueryBudget {
  count: number
  queries: Array<{
    model?: string
    action: string
    timestamp: number
  }>
}

export const queryBudgetStorage = new AsyncLocalStorage<QueryBudget>()

export function recordQuery(model?: string, action: string = "unknown"): void {
  const budget = queryBudgetStorage.getStore()
  if (!budget) return

  budget.count += 1
  budget.queries.push({
    model,
    action,
    timestamp: Date.now(),
  })

  if (process.env.NODE_ENV === "development" && budget.count > 20) {
    logger.warn(
      { count: budget.count, model, action },
      "Query budget exceeded (>20) for this request"
    )
  }
}

export function getQueryBudget(): QueryBudget | undefined {
  return queryBudgetStorage.getStore()
}

export async function runWithQueryBudget<T>(
  callback: () => Promise<T>,
  context: { type: string; name: string }
): Promise<T> {
  const budget: QueryBudget = { count: 0, queries: [] }
  return queryBudgetStorage.run(budget, async () => {
    const start = Date.now()
    try {
      return await callback()
    } finally {
      const duration = Date.now() - start
      if (budget.count > 0) {
        logger.info(
          {
            ...context,
            queryCount: budget.count,
            durationMs: duration,
            models: Array.from(new Set(budget.queries.map((q) => q.model))),
          },
          `DB Budget: ${context.type} ${context.name}`
        )
      }
    }
  })
}
