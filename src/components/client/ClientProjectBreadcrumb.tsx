"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/src/i18n/navigation"
import { CaretRightIcon } from "@phosphor-icons/react"

import { toHref } from "@/src/lib/utils/navigation"

const sectionByPath = {
  timeline: "timeline",
  approvals: "approvals",
  files: "files",
  briefing: "briefing",
  tasks: "tasks",
  financial: "financial",
} as const

type SectionKey = keyof typeof sectionByPath

export function ClientProjectBreadcrumb({
  projectId,
  projectName,
}: {
  projectId: string
  projectName: string
}): React.JSX.Element {
  const pathname = usePathname()
  const t = useTranslations("Dashboard.client_home.project.breadcrumb")
  const currentSegment = pathname.split("/").filter(Boolean).at(-1)
  const section =
    currentSegment && currentSegment in sectionByPath
      ? sectionByPath[currentSegment as SectionKey]
      : null

  return (
    <nav
      aria-label={t("label")}
      className="mb-6 flex min-w-0 items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
    >
      <Link
        href={toHref("/")}
        className="shrink-0 transition-colors hover:text-foreground"
      >
        {t("projects")}
      </Link>
      <CaretRightIcon className="size-3 shrink-0" weight="bold" />
      {section ? (
        <Link
          href={toHref(`/projects/${projectId}`)}
          className="min-w-0 truncate transition-colors hover:text-foreground"
        >
          {projectName}
        </Link>
      ) : (
        <span className="min-w-0 truncate text-foreground">{projectName}</span>
      )}
      {section ? (
        <>
          <CaretRightIcon className="size-3 shrink-0" weight="bold" />
          <span className="shrink-0 text-foreground">{t(section)}</span>
        </>
      ) : null}
    </nav>
  )
}
