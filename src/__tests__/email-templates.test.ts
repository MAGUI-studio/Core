import React from "react"

import { render } from "@react-email/render"
import { describe, expect, it } from "vitest"

import { SupportTicketReplyEmail } from "@/src/components/email/SupportTicketReplyEmail"

describe("SupportTicketReplyEmail", () => {
  it("renders correctly with reply content", async () => {
    const props = {
      contactName: "João Silva",
      ticketSubject: "Problema no Login",
      ticketNumber: "1234",
      ticketUrl: "https://portal.magui.studio/support/1234",
      messagePreview: "Sua senha foi resetada com sucesso.",
      isResolved: false,
    }

    const html = await render(
      React.createElement(SupportTicketReplyEmail, props)
    )

    expect(html).toContain("João Silva")
    expect(html).toContain("1234")
    expect(html).toContain("Problema no Login")
    expect(html).toContain("Sua senha foi resetada com sucesso.")
    expect(html).toContain("Nova Resposta no Suporte")
  })

  it("renders with resolution message when isResolved is true", async () => {
    const props = {
      contactName: "Maria Santos",
      ticketSubject: "Dúvida Comercial",
      ticketNumber: "5678",
      ticketUrl: "https://portal.magui.studio/support/5678",
      messagePreview: "Obrigado pelo contato.",
      isResolved: true,
    }

    const html = await render(
      React.createElement(SupportTicketReplyEmail, props)
    )

    expect(html).toContain("Ticket Resolvido")
    expect(html).toContain("Temos boas notícias")
    expect(html).toContain("reabrir o chamado")
  })
})
