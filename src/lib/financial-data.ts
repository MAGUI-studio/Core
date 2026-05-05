import prisma from "./prisma"

export async function getProjectInvoices(projectId: string) {
  return prisma.invoice.findMany({
    where: { projectId },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      installments: {
        orderBy: { number: "asc" },
        include: {
          paymentEvents: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getClientInvoices(userId: string) {
  return prisma.invoice.findMany({
    where: {
      clientId: userId,
      status: { not: "CANCELLED" },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
        },
      },
      installments: {
        orderBy: { number: "asc" },
        include: {
          paymentEvents: true,
        },
      },
    },
    orderBy: [{ issuedAt: "desc" }, { createdAt: "desc" }],
  })
}

export async function getAdminFinancialSummary() {
  const [invoices, paidEvents] = await Promise.all([
    prisma.invoice.findMany({
      include: { installments: true },
    }),
    prisma.paymentEvent.aggregate({
      _sum: { amount: true },
    }),
  ])

  const totalValue = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0)
  const paidValue = paidEvents._sum.amount || 0

  return {
    totalValue,
    paidValue,
    pendingValue: totalValue - paidValue,
    totalInvoices: invoices.length,
    paidPercentage: totalValue > 0 ? (paidValue / totalValue) * 100 : 0,
  }
}
