import { describe, expect, it } from "vitest"

import { briefingSchema } from "@/src/lib/validations/briefing"

describe("Briefing Schema Expansion", () => {
  it("should validate a complete expanded briefing", () => {
    const fullData = {
      businessDescription:
        "A premium software studio focused on elite digital authority and performance.",
      brandTone:
        "Sophisticated and strategic, focus on high performance and digital authority.",
      businessGoals:
        "Increase conversion by 20% and establish premium positioning in the market.",
      primaryCta: "Schedule a Strategic Demo",
      targetAudience:
        "Tech founders and enterprise managers aged 30-50, focused on digital authority.",
      differentiators:
        "Direct access to senior engineers and strategic design depth for enterprise.",
      logos: {
        primary: {
          name: "logo.png",
          url: "https://utfs.io/f/logo.png",
          key: "logo.png",
        },
      },
      palette: {
        primary: "#101010",
        secondary: "#FFFFFF",
      },
    }
    const result = briefingSchema.safeParse(fullData)
    if (!result.success) {
      console.error(JSON.stringify(result.error.issues, null, 2))
    }
    expect(result.success).toBe(true)
  })

  it("should fail if brandTone is too short", () => {
    const data = { brandTone: "Short" }
    const result = briefingSchema.safeParse(data)
    expect(result.success).toBe(false)
  })

  it("should fail if logos are missing", () => {
    const data = {
      brandTone:
        "Sophisticated and strategic, focus on high performance and digital authority.",
      businessGoals:
        "Increase conversion by 20% and establish premium positioning in the market.",
      primaryCta: "Schedule a Strategic Demo",
      targetAudience:
        "Tech founders and enterprise managers aged 30-50, focused on digital authority.",
      differentiators:
        "Direct access to senior engineers and strategic design depth for enterprise.",
      logos: {
        primary: null,
        secondary: null,
      },
    }
    const result = briefingSchema.safeParse(data)
    expect(result.success).toBe(false)
  })
})
