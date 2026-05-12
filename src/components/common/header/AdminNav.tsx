"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/src/i18n/navigation"
import {
  CaretDown,
  ChartLineUp,
  ChartPie,
  House,
  Lifebuoy,
  Link as LinkIcon,
  List,
  Money,
  Plus,
  ProjectorScreen,
  Tag,
  Users,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

import { MegaMenu } from "./MegaMenu"
import {
  type HeaderNavLeaf,
  getAdminHeaderNav,
  getClientHeaderNav,
  isNavItemActive,
} from "./navigation"

interface AdminNavProps {
  isAdmin?: boolean
}

function NavIcon({
  icon,
  className,
}: {
  icon: HeaderNavLeaf["icon"]
  className?: string
}) {
  switch (icon) {
    case "dashboard":
      return <ChartPie weight="duotone" className={className} />
    case "home":
      return <House weight="duotone" className={className} />
    case "crm":
      return <ChartLineUp weight="duotone" className={className} />
    case "clients":
      return <Users weight="duotone" className={className} />
    case "projects":
      return <ProjectorScreen weight="duotone" className={className} />
    case "plus":
      return <Plus weight="bold" className={className} />
    case "tag":
      return <Tag weight="bold" className={className} />
    case "link":
      return <LinkIcon weight="bold" className={className} />
    case "support":
      return <Lifebuoy weight="duotone" className={className} />
    case "money":
      return <Money weight="duotone" className={className} />
    case "list":
    default:
      return <List weight="bold" className={className} />
  }
}

export function AdminNav({ isAdmin }: AdminNavProps) {
  const t = useTranslations("Sidebar")
  const pathname = usePathname()
  const [openGroup, setOpenGroup] = React.useState<string | null>(null)

  const clientItems = getClientHeaderNav(t)
  const adminNav = getAdminHeaderNav(t)

  return (
    <nav className="hidden items-center gap-1.5 md:flex">
      {isAdmin ? (
        <>
          <Button
            variant="ghost"
            asChild
            className={`h-9 rounded-2xl px-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
              isNavItemActive(pathname, adminNav.dashboard)
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Link href={adminNav.dashboard.href}>
              <NavIcon
                icon={adminNav.dashboard.icon}
                className="mr-2 size-3.5"
              />
              {adminNav.dashboard.label}
            </Link>
          </Button>

          {adminNav.groups.map((group) => {
            const isActive = group.items.some((item) =>
              isNavItemActive(pathname, item)
            )

            return (
              <div
                key={group.label}
                className="relative"
                onMouseEnter={() => setOpenGroup(group.label)}
                onMouseLeave={() => setOpenGroup(null)}
              >
                <Button
                  variant="ghost"
                  className={`h-9 rounded-2xl px-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
                    isActive
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
                >
                  <NavIcon icon={group.icon} className="mr-2 size-3.5" />
                  {group.label}
                  <CaretDown
                    className={`ml-1.5 size-3 transition-transform duration-300 ${openGroup === group.label ? "rotate-180" : ""}`}
                  />
                </Button>

                <MegaMenu
                  isOpen={openGroup === group.label}
                  items={group.items}
                  onClose={() => setOpenGroup(null)}
                />
              </div>
            )
          })}
        </>
      ) : (
        clientItems.map((item) => (
          <Button
            key={item.href}
            variant="ghost"
            asChild
            className={`h-9 rounded-2xl px-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ${
              isNavItemActive(pathname, item)
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            }`}
          >
            <Link href={item.href}>
              <>
                <NavIcon icon={item.icon} className="mr-2 size-3.5" />
                {item.label}
              </>
            </Link>
          </Button>
        ))
      )}
    </nav>
  )
}
