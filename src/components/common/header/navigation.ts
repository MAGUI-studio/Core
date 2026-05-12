type HeaderStaticPath =
  | "/"
  | "/admin/clients"
  | "/admin/clients/register"
  | "/admin/crm"
  | "/admin/crm/register"
  | "/admin/crm/contracts"
  | "/admin/crm/proposals"
  | "/admin/crm/proposals/new"
  | "/admin/support"
  | "/admin/projects"
  | "/admin/projects/register"
  | "/admin/service-categories"
  | "/admin/service-categories/new"
  | "/magui-connect"
  | "/financial"
  | "/projects"
  | "/support"

export type HeaderNavLeaf = {
  href: HeaderStaticPath
  icon:
    | "dashboard"
    | "home"
    | "list"
    | "money"
    | "plus"
    | "projects"
    | "clients"
    | "crm"
    | "tag"
    | "link"
    | "support"
  label: string
  description?: string
  featured?: boolean
  matchPrefix?: HeaderStaticPath
  exact?: boolean
}

export type HeaderNavGroup = {
  icon: "crm" | "projects" | "clients"
  label: string
  items: HeaderNavLeaf[]
}

export function getAdminHeaderNav(t: (key: string) => string): {
  dashboard: HeaderNavLeaf
  groups: HeaderNavGroup[]
} {
  return {
    dashboard: {
      href: "/",
      icon: "dashboard",
      label: t("dashboard"),
      description: t("descriptions.dashboard"),
      exact: true,
    },
    groups: [
      {
        icon: "crm",
        label: t("commercial.title"),
        items: [
          {
            href: "/admin/crm",
            icon: "list",
            label: t("commercial.list"),
            description: t("descriptions.commercial_list"),
            matchPrefix: "/admin/crm",
          },
          {
            href: "/admin/crm/register",
            icon: "plus",
            label: t("commercial.create"),
            description: t("descriptions.commercial_create"),
            exact: true,
          },
          {
            href: "/admin/crm/proposals",
            icon: "list",
            label: t("commercial.proposals"),
            description: t("descriptions.proposals"),
            matchPrefix: "/admin/crm/proposals",
          },
          {
            href: "/admin/crm/proposals/new",
            icon: "plus",
            label: t("commercial.proposal_create"),
            description: t("descriptions.proposal_create"),
            featured: true,
            exact: true,
          },
          {
            href: "/admin/crm/contracts",
            icon: "list",
            label: "Contratos",
            description: "Consulte os contratos já gerados",
            matchPrefix: "/admin/crm/contracts",
          },
          {
            href: "/admin/support",
            icon: "support",
            label: t("commercial.support"),
            description: t("descriptions.support"),
            matchPrefix: "/admin/support",
          },
        ],
      },
      {
        icon: "projects",
        label: t("projects.title"),
        items: [
          {
            href: "/admin/projects",
            icon: "list",
            label: t("projects.list"),
            description: t("descriptions.projects_list"),
            matchPrefix: "/admin/projects",
          },
          {
            href: "/admin/projects/register",
            icon: "plus",
            label: t("projects.create"),
            description: t("descriptions.projects_create"),
            featured: true,
            exact: true,
          },
          {
            href: "/admin/service-categories",
            icon: "tag",
            label: t("projects.categories_all"),
            description: t("descriptions.service_categories"),
            matchPrefix: "/admin/service-categories",
          },
          {
            href: "/admin/service-categories/new",
            icon: "plus",
            label: t("projects.categories_new"),
            description: t("descriptions.service_categories"),
            exact: true,
          },
        ],
      },
      {
        icon: "clients",
        label: t("clients.title"),
        items: [
          {
            href: "/admin/clients",
            icon: "list",
            label: t("clients.list"),
            description: t("descriptions.clients_list"),
            matchPrefix: "/admin/clients",
          },
          {
            href: "/admin/clients/register",
            icon: "plus",
            label: t("clients.create"),
            description: t("descriptions.clients_create"),
            exact: true,
          },
        ],
      },
    ],
  }
}

export function getClientHeaderNav(
  t: (key: string) => string
): HeaderNavLeaf[] {
  return [
    {
      href: "/",
      icon: "home",
      label: t("client.home"),
      exact: true,
    },
    {
      href: "/projects",
      icon: "projects",
      label: t("client.projects"),
      matchPrefix: "/projects",
    },
    {
      href: "/financial",
      icon: "money",
      label: "Financeiro",
      matchPrefix: "/financial",
    },
    {
      href: "/support",
      icon: "support",
      label: t("client.support"),
      matchPrefix: "/support",
    },
    {
      href: "/magui-connect",
      icon: "link",
      label: t("client.maguiConnect"),
      matchPrefix: "/magui-connect",
    },
  ]
}

export function isNavItemActive(
  pathname: string,
  item: Pick<HeaderNavLeaf, "href" | "matchPrefix" | "exact">
) {
  if (item.exact) {
    return pathname === item.href
  }

  if (item.matchPrefix) {
    return pathname.startsWith(item.matchPrefix)
  }

  return pathname.startsWith(item.href)
}
