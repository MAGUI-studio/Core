import { describe, expect, it } from "vitest"

import { CreateInvoiceSchema } from "@/src/lib/validations/financial"

describe("Financial Module Logic", () => {
  it("should validate a correct invoice with installments", () => {
    const data = {
      title: "Desenvolvimento Web - Fase 1",
      totalAmount: 5000,
      projectId: "proj_123",
      installments: [
        { number: 1, amount: 2500, dueDate: new Date() },
        { number: 2, amount: 2500, dueDate: new Date() },
      ],
    }
    const result = CreateInvoiceSchema.safeParse(data)
    expect(result.success).toBe(true)
  })

  it("should fail if totalAmount is negative", () => {
    const data = {
      title: "Erro",
      totalAmount: -100,
      projectId: "proj_123",
      installments: [{ number: 1, amount: -100, dueDate: new Date() }],
    }
    const result = CreateInvoiceSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
