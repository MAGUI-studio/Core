"use client"

import * as React from "react"

import { ProjectMemberRole } from "@/src/generated/client"
import { DashboardProjectMember } from "@/src/types/dashboard"
import { Trash, UserPlus, UsersThree } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select"

import {
  addProjectMemberAction,
  removeProjectMemberAction,
} from "@/src/lib/actions/project.actions"

interface ProjectMembersManagerProps {
  projectId: string
  members: DashboardProjectMember[]
  clients: Array<{
    id: string
    name: string | null
    email: string
    companyName: string | null
  }>
}

function getMemberRoleLabel(role: ProjectMemberRole): string {
  return role === ProjectMemberRole.OWNER ? "Cliente principal" : "Colaborador"
}

export function ProjectMembersManager({
  projectId,
  members,
  clients,
}: ProjectMembersManagerProps): React.JSX.Element {
  const [selectedUserId, setSelectedUserId] = React.useState("")
  const [isSaving, setIsSaving] = React.useState(false)
  const [removingUserId, setRemovingUserId] = React.useState<string | null>(
    null
  )

  const memberUserIds = new Set(members.map((member) => member.userId))
  const availableClients = clients.filter(
    (client) => !memberUserIds.has(client.id)
  )

  async function handleAddMember(): Promise<void> {
    if (!selectedUserId) return

    setIsSaving(true)
    const result = await addProjectMemberAction({
      projectId,
      userId: selectedUserId,
      role: ProjectMemberRole.COLLABORATOR,
    })

    if (result.success) {
      toast.success("Colaborador adicionado ao projeto.")
      setSelectedUserId("")
    } else {
      toast.error(result.error ?? "Não foi possível adicionar colaborador.")
    }

    setIsSaving(false)
  }

  async function handleRemoveMember(userId: string): Promise<void> {
    setRemovingUserId(userId)
    const result = await removeProjectMemberAction({ projectId, userId })

    if (result.success) {
      toast.success("Colaborador removido do projeto.")
    } else {
      toast.error(result.error ?? "Não foi possível remover colaborador.")
    }

    setRemovingUserId(null)
  }

  return (
    <section className="grid gap-6 rounded-4xl border border-border/35 bg-background/55 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <UsersThree
              weight="duotone"
              className="size-4 text-brand-primary"
            />
            <h3 className="text-[10px] font-black uppercase tracking-[0.28em] text-muted-foreground/60">
              Acesso do cliente
            </h3>
          </div>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/60">
            Controle quem consegue ver e interagir com este projeto no portal do
            cliente.
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {members.length ? (
          members.map((member) => (
            <div
              key={member.id}
              className="flex flex-col gap-4 rounded-[1.5rem] border border-border/25 bg-muted/10 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-foreground">
                  {member.user.companyName ||
                    member.user.name ||
                    member.user.email}
                </p>
                <p className="truncate text-xs font-medium text-muted-foreground/65">
                  {member.user.email}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="h-7 px-3 text-[9px] font-black uppercase tracking-[0.16em]"
                >
                  {getMemberRoleLabel(member.role)}
                </Badge>
                {member.role !== ProjectMemberRole.OWNER ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={removingUserId === member.userId}
                    onClick={() => handleRemoveMember(member.userId)}
                    className="size-8 rounded-full text-muted-foreground hover:text-destructive"
                    aria-label="Remover colaborador"
                  >
                    <Trash weight="duotone" className="size-4" />
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-border/40 p-5 text-sm font-medium text-muted-foreground/60">
            Nenhum acesso configurado ainda.
          </div>
        )}
      </div>

      <div className="grid gap-3 rounded-[1.5rem] bg-muted/10 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
        <Select value={selectedUserId} onValueChange={setSelectedUserId}>
          <SelectTrigger size="lg" className="bg-background/80">
            <SelectValue placeholder="Selecionar cliente colaborador" />
          </SelectTrigger>
          <SelectContent>
            {availableClients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.companyName || client.name || client.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          onClick={handleAddMember}
          disabled={!selectedUserId || isSaving}
          className="h-12 rounded-full px-6 text-[10px] font-black uppercase tracking-[0.18em]"
        >
          <UserPlus weight="duotone" className="mr-2 size-4" />
          {isSaving ? "Adicionando" : "Adicionar"}
        </Button>
      </div>
    </section>
  )
}
