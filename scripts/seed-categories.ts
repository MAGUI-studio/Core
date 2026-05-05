import { PrismaPg } from "@prisma/adapter-pg"
import dotenv from "dotenv"
import pg from "pg"

import { PrismaClient } from "../src/generated/client/index.js"

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const categories = [
  {
    name: "Landing Page",
    description:
      "Pagina enxuta, focada em conversao, com entrega em 15 dias e opcional de i18n por R$ 400.",
    approach:
      "Entrega rapida de landing page com foco em conversao, performance e clareza comercial. Prazo base de 15 dias. Opcional de i18n: R$ 400.",
    suggestedValue: 120_000,
    imageUrl: null,
    isSubscription: false,
  },
  {
    name: "Site Institucional",
    description:
      "Site institucional completo com foco em autoridade digital, prazo de 20 dias e opcional de i18n por R$ 600.",
    approach:
      "Estrutura institucional para apresentar empresa, servicos e diferenciais com visual solido e navegacao clara. Prazo base de 20 dias. Opcional de i18n: R$ 600.",
    suggestedValue: 180_000,
    imageUrl: null,
    isSubscription: false,
  },
  {
    name: "Sistema / Agendamento",
    description:
      "Sistema com fluxos de operacao ou agendamento, prazo estimado de 30 a 45 dias e opcional de i18n por 30% do valor total.",
    approach:
      "Projeto mais robusto para operacao, reservas ou automacao de agenda. Prazo base entre 30 e 45 dias. Opcional de i18n: 30% do valor total do projeto.",
    suggestedValue: 250_000,
    imageUrl: null,
    isSubscription: false,
  },
  {
    name: "Taxa de Manutenção",
    description:
      "Assinatura recorrente de suporte e manutencao com valor mensal fixo e i18n inclusa.",
    approach:
      "Plano recorrente para manutencao, suporte tecnico e estabilidade operacional. Valor de R$ 100 por mes. I18n inclusa.",
    suggestedValue: 10_000,
    imageUrl: null,
    isSubscription: true,
  },
]

async function upsertCategory(category: {
  name: string
  description: string
  approach: string
  suggestedValue: number
  imageUrl: null
  isSubscription: boolean
}) {
  const existing = await prisma.serviceCategory.findFirst({
    where: {
      OR: [
        { name: category.name },
        {
          name:
            category.name === "Sistema / Agendamento"
              ? "Plataforma com Agendamento"
              : category.name === "Taxa de Manutenção"
                ? "Plano de Estabilidade e Suporte"
                : category.name,
        },
      ],
    },
    select: { id: true },
  })

  if (existing) {
    await prisma.serviceCategory.update({
      where: { id: existing.id },
      data: category,
    })
    return "updated"
  }

  await prisma.serviceCategory.create({
    data: category,
  })
  return "created"
}

async function main() {
  console.log("Seeding service categories...")

  for (const category of categories) {
    const result = await upsertCategory(category)
    console.log(`${result}: ${category.name}`)
  }

  console.log("Service categories seed finished.")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
