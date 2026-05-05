"use client"

import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import {
  CaretRight,
  ChartLineUp,
  ChartPie,
  House,
  List,
  Money,
  Plus,
  ProjectorScreen,
  Tag,
  Users,
} from "@phosphor-icons/react"
import { AnimatePresence, motion } from "framer-motion"

import { cn } from "@/src/lib/utils/utils"

import { HeaderNavLeaf } from "./navigation"

interface MegaMenuProps {
  isOpen: boolean
  items: HeaderNavLeaf[]
  onClose: () => void
}

export function MegaMenu({ isOpen, items, onClose }: MegaMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 w-[560px] pt-3"
          onMouseLeave={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden rounded-4xl bg-background p-5 shadow-[0_28px_56px_-18px_rgba(0,0,0,0.28)]"
          >
            <div className="grid grid-cols-2 gap-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "group relative flex min-h-24 items-start gap-3 rounded-[1.5rem] bg-muted/10 p-4 transition-all hover:bg-brand-primary/[0.06]",
                    item.featured && "bg-muted/10"
                  )}
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary transition-all group-hover:scale-105 group-hover:bg-brand-primary group-hover:text-white">
                    <NavIcon icon={item.icon} size={20} weight="duotone" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading text-[10px] font-black uppercase tracking-[0.18em] text-foreground">
                        {item.label}
                      </h4>
                    </div>
                    {item.description && (
                      <p className="pr-5 text-[10px] leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <CaretRight
                    weight="bold"
                    className="absolute right-4 top-4 size-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function NavIcon({
  icon,
  className,
  size,
  weight = "duotone",
}: {
  icon: HeaderNavLeaf["icon"]
  className?: string
  size?: number
  weight?: "duotone" | "bold" | "regular"
}) {
  const props = { className, size, weight }

  switch (icon) {
    case "dashboard":
      return <ChartPie {...props} />
    case "home":
      return <House {...props} />
    case "crm":
      return <ChartLineUp {...props} />
    case "clients":
      return <Users {...props} />
    case "projects":
      return <ProjectorScreen {...props} />
    case "plus":
      return <Plus {...props} weight="bold" />
    case "tag":
      return <Tag {...props} weight="bold" />
    case "money":
      return <Money {...props} />
    case "list":
    default:
      return <List {...props} weight="bold" />
  }
}
