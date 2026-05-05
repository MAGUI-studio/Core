export function getInternationalizationFeeCents(
  serviceCategoryName?: string | null,
  baseValueCents = 0
): number {
  if (!serviceCategoryName) return 0

  if (serviceCategoryName === "Landing Page") {
    return 40_000
  }

  if (serviceCategoryName === "Site Institucional") {
    return 60_000
  }

  if (
    serviceCategoryName === "Sistema / Agendamento" ||
    serviceCategoryName === "Plataforma com Agendamento"
  ) {
    return Math.round(baseValueCents * 0.3)
  }

  if (
    serviceCategoryName === "Taxa de Manutenção" ||
    serviceCategoryName === "Plano de Estabilidade e Suporte"
  ) {
    return 0
  }

  return 0
}
