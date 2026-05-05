"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link } from "@/src/i18n/navigation"
import {
  CaretDown,
  CaretUp,
  CaretUpDown,
  MagnifyingGlass,
  ShieldCheck,
  Trash,
  UserCircle,
  WarningOctagon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

import { deleteClientAction } from "@/src/lib/actions/user.actions"

interface UserData {
  id: string
  imageUrl: string
  firstName: string | null
  lastName: string | null
  username: string | null
  emailAddresses: { emailAddress: string }[]
  publicMetadata: { role?: string }
  projectCount: number
  activeProjectCount: number
}

interface ClientsTableProps {
  initialUsers: UserData[]
  stats: {
    total: number
    admins: number
    clients: number
    activeProjects: number
  }
}

type SortConfig = {
  key: "name" | "role" | "projects"
  direction: "asc" | "desc" | null
}

export function ClientsTable({
  initialUsers,
  stats,
}: ClientsTableProps): React.JSX.Element {
  const t = useTranslations("Admin.clients")
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [sort, setSort] = React.useState<SortConfig>({
    key: "name",
    direction: null,
  })
  const [pendingDeletion, startDeletion] = React.useTransition()

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  const filteredUsers = React.useMemo(() => {
    let result = [...initialUsers]

    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase()
      result = result.filter(
        (user) =>
          (user.firstName?.toLowerCase() || "").includes(query) ||
          (user.lastName?.toLowerCase() || "").includes(query) ||
          user.emailAddresses.some((e) =>
            e.emailAddress.toLowerCase().includes(query)
          ) ||
          (user.username?.toLowerCase() || "").includes(query)
      )
    }

    if (sort.direction) {
      result.sort((a, b) => {
        let valA: number | string = ""
        let valB: number | string = ""

        if (sort.key === "name") {
          valA = `${a.firstName || ""} ${a.lastName || ""}`.trim().toLowerCase()
          valB = `${b.firstName || ""} ${b.lastName || ""}`.trim().toLowerCase()
        } else if (sort.key === "role") {
          valA = (a.publicMetadata.role || "client").toLowerCase()
          valB = (b.publicMetadata.role || "client").toLowerCase()
        } else {
          valA = a.projectCount
          valB = b.projectCount
        }

        if (valA < valB) return sort.direction === "asc" ? -1 : 1
        if (valA > valB) return sort.direction === "asc" ? 1 : -1
        return 0
      })
    }

    return result
  }, [initialUsers, debouncedSearch, sort])

  const handleSort = (key: SortConfig["key"]) => {
    setSort((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" }
        if (prev.direction === "desc") return { key, direction: null }
        return { key, direction: "asc" }
      }
      return { key, direction: "asc" }
    })
  }

  const handleDelete = (userId: string) => {
    startDeletion(async () => {
      const result = await deleteClientAction(userId)
      if (result.success) {
        toast.success("Cliente removido do Clerk e da dashboard.")
      } else {
        toast.error(result.error ?? "Não foi possível remover o cliente.")
      }
    })
  }

  const getSortIcon = (key: SortConfig["key"]) => {
    if (sort.key !== key || !sort.direction)
      return <CaretUpDown className="size-3 opacity-30" />
    return sort.direction === "asc" ? (
      <CaretUp className="size-3 text-brand-primary" />
    ) : (
      <CaretDown className="size-3 text-brand-primary" />
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        {[
          {
            label: "Total no sistema",
            value: stats.total,
            icon: UserCircle,
          },
          {
            label: "Clientes ativos",
            value: stats.clients,
            icon: UserCircle,
          },
          {
            label: "Admins",
            value: stats.admins,
            icon: ShieldCheck,
          },
          {
            label: "Projetos em andamento",
            value: stats.activeProjects,
            icon: WarningOctagon,
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-[1.75rem] border border-border/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/45">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-black tracking-tight">
                  {card.value}
                </p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <card.icon size={24} weight="duotone" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 group">
          <MagnifyingGlass
            weight="duotone"
            className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            className="h-14 rounded-2xl border-border/40 bg-muted/20 pl-12 pr-4 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/30"
          />
        </div>
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/40 bg-muted/10 backdrop-blur-md">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead
                className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  {t("table.profile")}
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.id")}
              </TableHead>
              <TableHead
                className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer"
                onClick={() => handleSort("role")}
              >
                <div className="flex items-center gap-2">
                  {t("table.privileges")}
                  {getSortIcon("role")}
                </div>
              </TableHead>
              <TableHead
                className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer"
                onClick={() => handleSort("projects")}
              >
                <div className="flex items-center gap-2">
                  Projetos
                  {getSortIcon("projects")}
                </div>
              </TableHead>
              <TableHead className="px-8 h-16 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {t("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/40"
                >
                  {t("empty")}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isAdmin = user.publicMetadata?.role === "admin"
                return (
                  <TableRow
                    key={user.id}
                    className="group border-border/20 transition-all hover:bg-brand-primary/[0.03]"
                  >
                    <TableCell className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="size-11 border-2 border-background ring-2 ring-border/20 transition-all group-hover:ring-brand-primary/30">
                          <AvatarImage
                            src={user.imageUrl}
                            alt={user.firstName || "U"}
                          />
                          <AvatarFallback className="bg-muted/50 font-black text-brand-primary">
                            {user.firstName?.charAt(0) ||
                              user.emailAddresses[0]?.emailAddress
                                .charAt(0)
                                .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-heading text-sm font-black uppercase tracking-tight text-foreground">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                            @{user.username || "client"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <span className="font-sans text-xs font-bold text-muted-foreground/80">
                        {user.emailAddresses[0]?.emailAddress}
                      </span>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <Badge
                        variant="secondary"
                        className="bg-brand-primary/5 text-brand-primary hover:bg-brand-primary/10 border-brand-primary/20 text-[9px] font-black uppercase tracking-widest py-1 px-3"
                      >
                        {t(`roles.${user.publicMetadata?.role || "client"}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-black text-foreground">
                          {user.projectCount} projeto(s)
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/45">
                          {user.activeProjectCount} em andamento
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="rounded-full h-10 px-6 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-brand-primary hover:text-white"
                        >
                          <Link
                            href={{
                              pathname: "/admin/clients/[id]",
                              params: { id: user.id },
                            }}
                          >
                            {t("table.inspect")}
                          </Link>
                        </Button>

                        {!isAdmin && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full h-10 px-5 border-red-500/20 text-red-500 hover:bg-red-500/10"
                              >
                                <Trash size={14} className="mr-2" />
                                Excluir
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl rounded-4xl">
                              <DialogHeader>
                                <DialogTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                                  Remover cliente do sistema
                                </DialogTitle>
                                <DialogDescription>
                                  Isso remove o usuário do Clerk, encerra acesso
                                  ao painel e apaga o cadastro local. Projetos
                                  vinculados também serão removidos por cascata.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm leading-relaxed text-foreground/75">
                                Cliente:{" "}
                                <span className="font-black uppercase">
                                  {user.firstName} {user.lastName}
                                </span>
                                <br />
                                Projetos vinculados:{" "}
                                <span className="font-black">
                                  {user.projectCount}
                                </span>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button
                                    variant="outline"
                                    className="rounded-full"
                                  >
                                    Cancelar
                                  </Button>
                                </DialogClose>
                                <Button
                                  onClick={() => handleDelete(user.id)}
                                  disabled={pendingDeletion}
                                  className="rounded-full bg-red-500 hover:bg-red-500/90"
                                >
                                  Confirmar exclusão
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/20 bg-muted/20 px-8 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
            {t("summary", { count: filteredUsers.length })}
          </p>
        </div>
      </Card>
    </div>
  )
}
