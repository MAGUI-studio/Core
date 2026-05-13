"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { ProjectStatus } from "@/src/generated/client"
import { DashboardProject } from "@/src/types/dashboard"
import {
  CaretUpDown,
  Check,
  FolderSimple,
  MagnifyingGlass,
} from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/src/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"

import { buildProjectScheduleView } from "@/src/lib/project-schedule"
import { formatLocalTime } from "@/src/lib/utils/utils"

interface ProjectSwitcherProps {
  projects: DashboardProject[]
  selectedProject: DashboardProject | null
  onProjectSelect: (projectId: string) => void
}

export function ProjectSwitcher({
  projects,
  selectedProject,
  onProjectSelect,
}: ProjectSwitcherProps): React.JSX.Element {
  const t = useTranslations("Dashboard")
  const tStatus = useTranslations("Dashboard.status")
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="group relative flex h-auto min-w-[280px] max-w-[340px] items-center justify-between gap-4 rounded-full border border-border/40 bg-background/50 py-3 pl-5 pr-4 text-left shadow-sm backdrop-blur-md transition-all hover:border-brand-primary/30 hover:bg-background/80"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary transition-transform duration-300 group-hover:scale-105">
              <FolderSimple weight="fill" className="size-5" />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-[11px] font-black uppercase tracking-tight text-foreground/90">
                {selectedProject?.name || t("select_project")}
              </span>
              <span className="truncate text-[9px] font-bold uppercase tracking-widest text-muted-foreground/50">
                {selectedProject
                  ? tStatus(selectedProject.status as ProjectStatus)
                  : "Studio Hub"}
              </span>
            </div>
          </div>
          <CaretUpDown
            weight="bold"
            className="size-4 shrink-0 text-muted-foreground/30 transition-colors group-hover:text-brand-primary"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[340px] overflow-hidden rounded-4xl border-border/30 bg-background/95 p-0 shadow-2xl backdrop-blur-xl"
        align="start"
        sideOffset={12}
      >
        <Command className="bg-transparent">
          <div className="relative border-b border-border/15 px-3 py-2">
            <MagnifyingGlass className="absolute left-6 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/40" />
            <CommandInput
              placeholder={t("filter_projects")}
              className="h-12 border-none bg-transparent pl-9 font-sans text-xs font-medium focus:ring-0"
            />
          </div>

          <CommandList className="max-h-[380px] scrollbar-hide">
            <CommandEmpty className="py-12 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
              {t("no_project_found")}
            </CommandEmpty>
            <CommandGroup className="p-3">
              {projects.map((project) =>
                (() => {
                  const schedule = buildProjectScheduleView(
                    project.scheduleData,
                    project.status
                  )

                  return (
                    <CommandItem
                      key={project.id}
                      value={project.name}
                      onSelect={() => {
                        onProjectSelect(project.id)
                        setOpen(false)
                      }}
                      className="group mb-1 flex cursor-pointer items-center justify-between rounded-2xl px-4 py-4 transition-all hover:bg-brand-primary/[0.04] aria-selected:bg-brand-primary/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted/15 text-muted-foreground/60 transition-colors group-hover:bg-brand-primary/10 group-hover:text-brand-primary">
                          <FolderSimple weight="fill" className="size-5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[11px] font-black uppercase tracking-tight text-foreground/80">
                            {project.name}
                          </span>
                          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                            Previsão:{" "}
                            {schedule.currentForecastDate
                              ? formatLocalTime(
                                  new Date(schedule.currentForecastDate),
                                  "UTC"
                                )
                              : "aguardando briefing"}
                          </span>
                        </div>
                      </div>
                      {selectedProject?.id === project.id && (
                        <div className="flex size-6 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                          <Check weight="bold" className="size-3" />
                        </div>
                      )}
                    </CommandItem>
                  )
                })()
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
