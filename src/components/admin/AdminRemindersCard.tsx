import * as React from "react"

import { ScheduledReminderType } from "@/src/generated/client"
import { Link } from "@/src/i18n/navigation"
import {
  ArrowRight,
  BellRinging,
  CheckCircle,
  ClockCountdown,
  FolderOpen,
  NotePencil,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card"

type ReminderItem = {
  id: string
  title: string
  message: string
  ctaPath?: string | null
  scheduledFor: Date | string
  type: ScheduledReminderType
}

const reminderIcon = {
  [ScheduledReminderType.LEAD_STALLED]: BellRinging,
  [ScheduledReminderType.APPROVAL_PENDING]: CheckCircle,
  [ScheduledReminderType.PROJECT_SILENT]: FolderOpen,
  [ScheduledReminderType.ACTION_ITEM_OVERDUE]: NotePencil,
  [ScheduledReminderType.CLIENT_ON_HOLD]: WarningCircle,
  [ScheduledReminderType.PROJECT_ABANDONED]: WarningCircle,
}

const reminderLabel = {
  [ScheduledReminderType.LEAD_STALLED]: "Lead parado",
  [ScheduledReminderType.APPROVAL_PENDING]: "Aprovacao pendente",
  [ScheduledReminderType.PROJECT_SILENT]: "Projeto sem update",
  [ScheduledReminderType.ACTION_ITEM_OVERDUE]: "Tarefa vencida",
  [ScheduledReminderType.CLIENT_ON_HOLD]: "Projeto suspenso",
  [ScheduledReminderType.PROJECT_ABANDONED]: "Projeto abandonado",
}

export function AdminRemindersCard({
  items,
}: {
  items: ReminderItem[]
}): React.JSX.Element {
  return (
    <Card className="rounded-4xl border-border/40 bg-muted/10 backdrop-blur-md">
      <CardHeader className="border-b border-border/20">
        <CardTitle className="font-heading text-2xl font-black uppercase tracking-tight">
          Lembretes automaticos
        </CardTitle>
        <CardDescription>
          Alertas internos criados pelo sistema para evitar que algo passe
          batido.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        {items.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
            Nenhum lembrete ativo no momento.
          </div>
        ) : (
          items.map((item) => {
            const Icon = reminderIcon[item.type]

            return (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-[1.5rem] border border-border/30 bg-background/60 p-5 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex size-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <Icon className="size-5" weight="duotone" />
                  </div>
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                        {reminderLabel[item.type]}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/35">
                        •
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/45">
                        <ClockCountdown className="size-3.5" />
                        {new Date(item.scheduledFor).toLocaleDateString(
                          "pt-BR"
                        )}
                      </span>
                    </div>
                    <p className="text-base font-black tracking-tight text-foreground">
                      {item.title}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground/75">
                      {item.message}
                    </p>
                  </div>
                </div>

                {item.ctaPath ? (
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.18em]"
                  >
                    <Link href={item.ctaPath as never}>
                      Abrir
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                ) : null}
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
