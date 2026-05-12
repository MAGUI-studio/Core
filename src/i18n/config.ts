export const locales = ["pt", "en"] as const
export const defaultLocale = "pt" as const

export const pathnames = {
  "/": "/",
  "/admin": {
    pt: "/admin",
    en: "/admin",
  },
  "/admin/clients": {
    pt: "/admin/clientes",
    en: "/admin/clients",
  },
  "/admin/clients/register": {
    pt: "/admin/clientes/cadastrar",
    en: "/admin/clients/register",
  },
  "/admin/clients/[id]": {
    pt: "/admin/clientes/[id]",
    en: "/admin/clients/[id]",
  },
  "/admin/crm": {
    pt: "/admin/prospeccao",
    en: "/admin/crm",
  },
  "/admin/crm/register": {
    pt: "/admin/prospeccao/cadastrar",
    en: "/admin/crm/register",
  },
  "/admin/crm/kanban": {
    pt: "/admin/prospeccao/kanban",
    en: "/admin/crm/kanban",
  },
  "/admin/crm/list": {
    pt: "/admin/prospeccao/lista",
    en: "/admin/crm/list",
  },
  "/admin/crm/proposals": {
    pt: "/admin/prospeccao/propostas",
    en: "/admin/crm/proposals",
  },
  "/admin/crm/contracts": {
    pt: "/admin/prospeccao/contratos",
    en: "/admin/crm/contracts",
  },
  "/admin/support": {
    pt: "/admin/tickets",
    en: "/admin/support",
  },
  "/admin/support/[id]": {
    pt: "/admin/tickets/[id]",
    en: "/admin/support/[id]",
  },
  "/admin/crm/proposals/new": {
    pt: "/admin/prospeccao/propostas/nova",
    en: "/admin/crm/proposals/new",
  },
  "/proposal/[identifier]": {
    pt: "/proposta/[identifier]",
    en: "/proposal/[identifier]",
  },
  "/admin/crm/leads/[id]": {
    pt: "/admin/prospeccao/leads/[id]",
    en: "/admin/crm/leads/[id]",
  },
  "/admin/crm/leads/[id]/proposal": {
    pt: "/admin/prospeccao/leads/[id]/proposta",
    en: "/admin/crm/leads/[id]/proposal",
  },
  "/admin/crm/leads/[id]/proposals": {
    pt: "/admin/prospeccao/leads/[id]/propostas",
    en: "/admin/crm/leads/[id]/proposals",
  },
  "/admin/projects": {
    pt: "/admin/projetos",
    en: "/admin/projects",
  },
  "/admin/projects/register": {
    pt: "/admin/projetos/cadastrar",
    en: "/admin/projects/register",
  },
  "/admin/projects/[id]": {
    pt: "/admin/projetos/[id]",
    en: "/admin/projects/[id]",
  },
  "/admin/projects/[id]/assets": {
    pt: "/admin/projetos/[id]/ativos",
    en: "/admin/projects/[id]/assets",
  },
  "/admin/service-categories": {
    pt: "/admin/categorias-de-servico",
    en: "/admin/service-categories",
  },
  "/admin/service-categories/new": {
    pt: "/admin/categorias-de-servico/nova",
    en: "/admin/service-categories/new",
  },
  "/admin/service-categories/[id]": {
    pt: "/admin/categorias-de-servico/[id]",
    en: "/admin/service-categories/[id]",
  },
  "/projects": {
    pt: "/projetos",
    en: "/projects",
  },
  "/financial": {
    pt: "/financeiro",
    en: "/financial",
  },
  "/support": {
    pt: "/suporte",
    en: "/support",
  },
  "/support/[id]": {
    pt: "/suporte/[id]",
    en: "/support/[id]",
  },
  "/projects/[id]": {
    pt: "/projetos/[id]",
    en: "/projects/[id]",
  },
  "/projects/[id]/timeline": {
    pt: "/projetos/[id]/timeline",
    en: "/projects/[id]/timeline",
  },
  "/projects/[id]/approvals": {
    pt: "/projetos/[id]/validacoes",
    en: "/projects/[id]/approvals",
  },
  "/projects/[id]/files": {
    pt: "/projetos/[id]/arquivos",
    en: "/projects/[id]/files",
  },
  "/projects/[id]/briefing": {
    pt: "/projetos/[id]/briefing",
    en: "/projects/[id]/briefing",
  },
  "/projects/[id]/tasks": {
    pt: "/projetos/[id]/tarefas",
    en: "/projects/[id]/tasks",
  },
  "/projects/[id]/financial": {
    pt: "/projetos/[id]/investimento",
    en: "/projects/[id]/financial",
  },
  "/magui-connect": {
    pt: "/magui-connect",
    en: "/magui-connect",
  },
  "/magui-connect/links": {
    pt: "/magui-connect/links",
    en: "/magui-connect/links",
  },
  "/magui-connect/analytics": {
    pt: "/magui-connect/analytics",
    en: "/magui-connect/analytics",
  },
}

export type AppPathnames = keyof typeof pathnames
