"use client"

import React from "react"

import { useTranslations } from "next-intl"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  CaretUpDown,
  Check,
  DotsSixVertical,
  PencilSimple,
  Star,
  Trash,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"

import {
  deleteOwnMaguiConnectLinkAction,
  updateOwnMaguiConnectLinkAction,
} from "@/src/lib/actions/maguiConnect.actions"
import { cn } from "@/src/lib/utils/utils"

import { MAGUI_CONNECT_LINK_KIND_PRESETS } from "@/src/config/magui-connect-presets"

interface MaguiConnectLinkItemProps {
  link: {
    id: string
    sectionId: string | null
    label: string
    url: string
    customShortDescription: string | null
    icon: string | null
    kind: string
    isFeatured: boolean
    openInNewTab: boolean
    startsAt: Date | null
    expiresAt: Date | null
  }
  sections: Array<{ id: string; title: string }>
  onDelete?: () => void
  onUpdate?: (updatedLink: {
    id: string
    sectionId: string | null
    label: string
    url: string
    customShortDescription: string | null
    icon: string | null
    kind: string
    isFeatured: boolean
    openInNewTab: boolean
    startsAt: Date | null
    expiresAt: Date | null
  }) => void
}

export function MaguiConnectLinkItem({
  link,
  sections,
  onDelete,
  onUpdate,
}: MaguiConnectLinkItemProps) {
  const t = useTranslations("MaguiConnect")
  const router = useRouter()
  const [isPending, startTransition] = React.useTransition()
  const [isFeatured, setIsFeatured] = React.useState(link.isFeatured)
  const [prevIsFeatured, setPrevIsFeatured] = React.useState(link.isFeatured)

  if (link.isFeatured !== prevIsFeatured) {
    setPrevIsFeatured(link.isFeatured)
    setIsFeatured(link.isFeatured)
  }

  const [openSection, setOpenSection] = React.useState(false)

  const [editLabel, setEditLabel] = React.useState(link.label)
  const [editUrl, setEditUrl] = React.useState(link.url)
  const [editCustomShortDescription, setEditCustomShortDescription] =
    React.useState(link.customShortDescription ?? "")
  const [editKind, setEditKind] = React.useState(link.kind)
  const [editStartsAt, setEditStartsAt] = React.useState(
    link.startsAt ? toDateTimeLocalValue(link.startsAt) : ""
  )
  const [editExpiresAt, setEditExpiresAt] = React.useState(
    link.expiresAt ? toDateTimeLocalValue(link.expiresAt) : ""
  )
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [openKind, setOpenKind] = React.useState(false)

  const countdown = useCountdownLabel(link.expiresAt)

  const preset = MAGUI_CONNECT_LINK_KIND_PRESETS.find(
    (p) => p.value === link.kind
  )
  const iconSrc = preset?.icon
  const scheduleStatus = getLinkScheduleStatus(link, t, countdown)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const toggleFeatured = async () => {
    const nextState = !isFeatured
    setIsFeatured(nextState)
    try {
      const updated = await updateOwnMaguiConnectLinkAction(link.id, {
        label: link.label,
        url: link.url,
        customShortDescription: link.customShortDescription,
        startsAt: link.startsAt ? link.startsAt.toISOString() : null,
        expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
        kind: link.kind,
        isFeatured: nextState,
        openInNewTab: link.openInNewTab,
        sectionId: link.sectionId,
      })
      onUpdate?.(updated)
      router.refresh()
    } catch (error) {
      console.error(error)
      setIsFeatured(!nextState)
    }
  }

  const changeSection = async (newSectionId: string | null) => {
    try {
      const updated = await updateOwnMaguiConnectLinkAction(link.id, {
        label: link.label,
        url: link.url,
        customShortDescription: link.customShortDescription,
        startsAt: link.startsAt ? link.startsAt.toISOString() : null,
        expiresAt: link.expiresAt ? link.expiresAt.toISOString() : null,
        kind: link.kind,
        isFeatured: link.isFeatured,
        openInNewTab: link.openInNewTab,
        sectionId: newSectionId,
      })
      onUpdate?.(updated)
      router.refresh()
      toast.success("Grupo alterado")
    } catch (error) {
      toast.error("Erro ao alterar grupo")
    }
  }

  const handleEditSave = async () => {
    try {
      const updated = await updateOwnMaguiConnectLinkAction(link.id, {
        label: editLabel,
        url: editUrl,
        customShortDescription: editCustomShortDescription,
        startsAt: editStartsAt || null,
        expiresAt: editExpiresAt || null,
        kind: editKind,
        isFeatured: link.isFeatured,
        openInNewTab: link.openInNewTab,
        sectionId: link.sectionId,
      })
      onUpdate?.(updated)
      setIsEditDialogOpen(false)
      router.refresh()
      toast.success("Link atualizado")
    } catch (error) {
      toast.error("Erro ao atualizar link")
    }
  }

  const currentSection = sections.find((s) => s.id === link.sectionId)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "group relative transition-all rounded-2xl overflow-hidden border border-border/10",
        isDragging && "z-50 scale-[1.01] opacity-50 bg-muted/20",
        isFeatured && "bg-brand-primary/[0.03] border-brand-primary/10"
      )}
      style={style}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:py-4 sm:px-2 transition-colors">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab p-1 text-muted-foreground/30 transition-colors hover:text-foreground active:cursor-grabbing shrink-0"
            aria-label={t("reorder")}
          >
            <DotsSixVertical size={18} weight="bold" />
          </button>

          <div
            className={cn(
              "flex h-10 w-10 flex-shrink-0 items-center justify-center transition-all overflow-hidden bg-muted/5 rounded-xl border border-border/10"
            )}
          >
            {iconSrc && (
              <div className="relative h-6 w-6">
                <Image
                  src={iconSrc}
                  alt={link.label}
                  fill
                  className="object-contain"
                />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-bold">{link.label}</p>
              {isFeatured && (
                <span className="bg-brand-primary/10 text-brand-primary text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md shrink-0">
                  Destaque
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="truncate font-mono text-[9px] text-muted-foreground/60 max-w-[150px] sm:max-w-none">
                {link.customShortDescription || link.url}
              </p>
              <span className="text-[10px] text-muted-foreground/20 shrink-0">
                •
              </span>
              <Popover open={openSection} onOpenChange={setOpenSection}>
                <PopoverTrigger asChild>
                  <button className="text-[9px] font-black uppercase tracking-widest text-brand-primary/60 hover:text-brand-primary transition-colors flex items-center gap-1 min-w-0">
                    <span className="truncate">
                      {currentSection?.title ?? "Sem Grupo"}
                    </span>
                    <CaretUpDown size={10} className="shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[200px] p-0 rounded-xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl"
                  align="start"
                >
                  <Command className="rounded-xl shadow-none">
                    <CommandInput
                      placeholder="Alterar grupo..."
                      className="h-10 text-[11px]"
                    />
                    <CommandList>
                      <CommandEmpty className="py-2 text-[10px]">
                        Nenhum grupo.
                      </CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => {
                            changeSection(null)
                            setOpenSection(false)
                          }}
                          className="flex items-center gap-2 py-2 px-3 text-[10px] font-bold uppercase tracking-wider"
                        >
                          Sem grupo
                          <Check
                            size={12}
                            className={cn(
                              "text-brand-primary ml-auto",
                              !link.sectionId ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                        {sections.map((s) => (
                          <CommandItem
                            key={s.id}
                            value={s.title}
                            onSelect={() => {
                              changeSection(s.id)
                              setOpenSection(false)
                            }}
                            className="flex items-center gap-2 py-2 px-3 text-[10px] font-bold uppercase tracking-wider"
                          >
                            <span className="truncate">{s.title}</span>
                            <Check
                              size={12}
                              className={cn(
                                "text-brand-primary ml-auto",
                                link.sectionId === s.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="mt-1.5 space-y-0.5">
              {scheduleStatus.dateLine ? (
                <p className="text-[9px] text-muted-foreground/50 truncate">
                  {scheduleStatus.dateLine}
                </p>
              ) : null}
              {scheduleStatus.message ? (
                <p
                  className={cn(
                    "text-[9px] font-semibold truncate",
                    scheduleStatus.tone === "warning" &&
                      "text-amber-500 dark:text-amber-400",
                    scheduleStatus.tone === "danger" && "text-destructive",
                    scheduleStatus.tone === "info" && "text-brand-primary"
                  )}
                >
                  {scheduleStatus.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 shrink-0 border-t border-border/5 sm:border-0 pt-3 sm:pt-0">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="h-9 w-9 sm:h-8 sm:w-8 cursor-pointer rounded-full text-muted-foreground/40 transition-all hover:bg-muted/40 hover:text-foreground bg-muted/5 sm:bg-transparent"
                size="icon"
                variant="ghost"
                title="Editar Detalhes"
              >
                <PencilSimple size={16} />
              </Button>
            </DialogTrigger>
            <DialogContent className="overflow-y-auto max-h-[90vh] w-[95vw] sm:max-w-[500px] rounded-3xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight">
                  Editar Link
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-8 sm:gap-10">
                <div className="grid gap-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
                    {t("linkLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-base font-bold shadow-none focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                  />
                </div>

                <div className="grid gap-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
                    {t("customShortDescriptionLabel")}
                  </Label>
                  <Input
                    className="h-12 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm shadow-none focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                    value={editCustomShortDescription}
                    onChange={(e) =>
                      setEditCustomShortDescription(e.target.value)
                    }
                  />
                </div>

                <div className="grid gap-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
                    {t("linkTypeLabel")}
                  </Label>
                  <Popover open={openKind} onOpenChange={setOpenKind}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        role="combobox"
                        aria-expanded={openKind}
                        className="h-12 w-full justify-between rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm font-normal shadow-none hover:bg-transparent hover:border-brand-primary focus-visible:ring-0 transition-all"
                      >
                        <span className="truncate">
                          {MAGUI_CONNECT_LINK_KIND_PRESETS.find(
                            (presetOption) => presetOption.value === editKind
                          )?.label ?? t("linkTypePlaceholder")}
                        </span>
                        <CaretUpDown
                          size={16}
                          className="ml-2 opacity-50 shrink-0"
                        />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[280px] sm:w-[300px] p-0 rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl"
                      align="start"
                    >
                      <Command className="rounded-2xl shadow-none">
                        <CommandInput
                          placeholder={t("linkTypeSearchPlaceholder")}
                          className="h-12"
                        />
                        <CommandList
                          className="max-h-72 overflow-y-auto overscroll-contain"
                          onWheel={(event) => event.stopPropagation()}
                        >
                          <CommandEmpty>{t("linkTypeEmpty")}</CommandEmpty>
                          <CommandGroup>
                            {MAGUI_CONNECT_LINK_KIND_PRESETS.map(
                              (presetOption) => (
                                <CommandItem
                                  key={presetOption.value}
                                  value={presetOption.label}
                                  onSelect={() => {
                                    setEditKind(presetOption.value)
                                    setOpenKind(false)
                                  }}
                                  className="flex items-center gap-3 py-3 px-4 text-xs font-normal"
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    {presetOption.icon.startsWith("/") ? (
                                      <div className="relative h-6 w-6">
                                        <Image
                                          src={presetOption.icon}
                                          alt={presetOption.label}
                                          fill
                                          className="object-contain"
                                        />
                                      </div>
                                    ) : null}
                                    {presetOption.label}
                                  </div>

                                  <Check
                                    size={16}
                                    className={cn(
                                      "text-brand-primary",
                                      editKind === presetOption.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              )
                            )}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="grid gap-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
                      {t("linkStartAtLabel")}
                    </Label>
                    <Input
                      className="h-12 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm shadow-none focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                      type="datetime-local"
                      value={editStartsAt}
                      onChange={(e) => setEditStartsAt(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
                      {t("linkExpiresAtLabel")}
                    </Label>
                    <Input
                      className="h-12 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-sm shadow-none focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                      type="datetime-local"
                      value={editExpiresAt}
                      onChange={(e) => setEditExpiresAt(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
                    {t("linkUrl")}
                  </Label>
                  <Input
                    className="h-12 rounded-none border-0 border-b border-border/60 bg-transparent px-0 font-mono text-[10px] sm:text-xs shadow-none focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
                    value={editUrl}
                    onChange={(e) => setEditUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-10 sm:mt-12">
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto rounded-full px-8 h-12 text-[10px] font-black uppercase tracking-widest order-2 sm:order-1"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  className="w-full sm:w-auto rounded-full bg-brand-primary px-10 h-12 text-[10px] font-black uppercase tracking-widest text-white shadow-none order-1 sm:order-2"
                  onClick={handleEditSave}
                >
                  Salvar Alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            className={cn(
              "h-9 w-9 sm:h-8 sm:w-8 cursor-pointer rounded-full transition-all bg-muted/5 sm:bg-transparent",
              isFeatured
                ? "text-brand-primary hover:bg-brand-primary/10 bg-brand-primary/5"
                : "text-muted-foreground/40 hover:text-foreground hover:bg-muted/40"
            )}
            size="icon"
            variant="ghost"
            title="Destacar Link"
            onClick={toggleFeatured}
          >
            <Star size={16} weight={isFeatured ? "fill" : "regular"} />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="h-9 w-9 sm:h-8 sm:w-8 cursor-pointer rounded-full text-muted-foreground/40 transition-all hover:bg-destructive/10 hover:text-destructive bg-muted/5 sm:bg-transparent"
                size="icon"
                variant="ghost"
                disabled={isPending}
                title={t("deleteLink")}
              >
                <Trash size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[95vw] max-w-md rounded-3xl border-border/60 bg-background/95 backdrop-blur-xl shadow-2xl p-6 sm:p-8">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-heading text-xl font-black uppercase tracking-tight">
                  {t("confirmDelete")}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
                  Tem certeza que deseja remover este link? Esta ação não pode
                  ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-8">
                <AlertDialogCancel className="w-full sm:w-auto rounded-full border-border/40 text-xs font-bold uppercase tracking-widest hover:bg-muted/10 h-12 px-8 order-2 sm:order-1">
                  {t("cancel")}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    startTransition(async () => {
                      try {
                        await deleteOwnMaguiConnectLinkAction(link.id)
                        onDelete?.()
                        toast.success(t("linkDeleted"))
                      } catch (error) {
                        console.error(error)
                        toast.error(t("deleteFailed"))
                      }
                    })
                  }}
                  className="w-full sm:w-auto rounded-full bg-red-500 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-600 shadow-lg shadow-red-500/20 h-12 px-8 order-1 sm:order-2"
                >
                  {t("delete")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}

function toDateTimeLocalValue(value: Date | string) {
  const dateValue = value instanceof Date ? value : new Date(value)
  const local = new Date(
    dateValue.getTime() - dateValue.getTimezoneOffset() * 60000
  )
  return local.toISOString().slice(0, 16)
}

function useCountdownLabel(expiresAtValue: string | Date | null) {
  const t = useTranslations("MaguiConnect")
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    if (!expiresAtValue) return

    const interval = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [expiresAtValue])

  if (!expiresAtValue) return null

  const expiresAt = new Date(expiresAtValue).getTime()
  const diff = expiresAt - now

  if (diff <= 0) return null

  const totalSeconds = Math.floor(diff / 1000)

  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return t("linkExpiresCountdown", { hours, minutes, seconds })
}

function getLinkScheduleStatus(
  link: {
    startsAt: Date | null
    expiresAt: Date | null
  },
  t: ReturnType<typeof useTranslations<"MaguiConnect">>,
  countdown: string | null
) {
  const now = new Date()
  const startsAt = link.startsAt ? new Date(link.startsAt) : null
  const expiresAt = link.expiresAt ? new Date(link.expiresAt) : null

  const dateParts: string[] = []
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }

  if (startsAt) {
    dateParts.push(
      `${t("scheduleStartsLabel")}: ${startsAt.toLocaleString(
        "pt-BR",
        formatOptions
      )}`
    )
  }
  if (expiresAt) {
    dateParts.push(
      `${t("scheduleEndsLabel")}: ${expiresAt.toLocaleString(
        "pt-BR",
        formatOptions
      )}`
    )
  }

  if (expiresAt && expiresAt < now) {
    return {
      tone: "danger" as const,
      dateLine: dateParts.join(" • "),
      message: t("linkExpiredMessage"),
    }
  }

  if (startsAt && startsAt > now) {
    const diffDays = Math.ceil(
      (startsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    return {
      tone: "info" as const,
      dateLine: dateParts.join(" • "),
      message: t("linkScheduledMessage", { days: diffDays }),
    }
  }

  if (expiresAt) {
    const diffDays = Math.ceil(
      (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
    if (diffDays >= 0) {
      return {
        tone: diffDays <= 7 ? ("warning" as const) : ("info" as const),
        dateLine: dateParts.join(" • "),
        message: countdown ? (
          <span className="text-red-500">{countdown}</span>
        ) : (
          t("linkExpiresSoonMessage", { days: diffDays })
        ),
      }
    }
  }

  return {
    tone: "info" as const,
    dateLine: dateParts.length > 0 ? dateParts.join(" • ") : null,
    message: null,
  }
}
