"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link } from "@/src/i18n/navigation"
import {
  ArrowSquareOut,
  CaretDown,
  CaretUp,
  CaretUpDown,
  DotsThreeVertical,
  Funnel,
  MagnifyingGlass,
  ShieldCheck,
  UserCircle,
  WarningOctagon,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
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
        toast.error(result.error ?? "Nao foi possivel remover o cliente.")
      }
    })
  }

  const getSortIcon = (key: SortConfig["key"]) => {
    if (sort.key !== key || !sort.direction) {
      return <CaretUpDown className="size-3 opacity-30" />
    }

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
        <div className="group relative flex-1">
          <MagnifyingGlass
            weight="bold"
            className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-primary"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search_placeholder")}
            className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-11 pr-4 text-xs font-bold transition-all focus-visible:bg-muted/20 focus-visible:ring-brand-primary/20"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 text-muted-foreground/40">
            <Funnel weight="bold" size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              Filtros
            </span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  {t("table.profile")}
                  {getSortIcon("name")}
                </div>
              </TableHead>
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {t("table.id")}
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                onClick={() => handleSort("role")}
              >
                <div className="flex items-center gap-2">
                  {t("table.privileges")}
                  {getSortIcon("role")}
                </div>
              </TableHead>
              <TableHead
                className="h-16 cursor-pointer px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60"
                onClick={() => handleSort("projects")}
              >
                <div className="flex items-center gap-2">
                  Projetos
                  {getSortIcon("projects")}
                </div>
              </TableHead>
              <TableHead className="h-16 px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {t("table.actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-48 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30"
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
                    className="group border-border/15 transition-all hover:bg-brand-primary/[0.02]"
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
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
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
                        className="border-brand-primary/20 bg-brand-primary/5 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-brand-primary hover:bg-brand-primary/10"
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
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          asChild
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-full text-muted-foreground/40 hover:bg-brand-primary/10 hover:text-brand-primary"
                          title={t("table.inspect")}
                        >
                          <Link
                            href={{
                              pathname: "/admin/clients/[id]",
                              params: { id: user.id },
                            }}
                          >
                            <ArrowSquareOut weight="bold" size={16} />
                          </Link>
                        </Button>

                        {!isAdmin ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-9 rounded-full text-muted-foreground/40 hover:bg-muted/10"
                              >
                                <DotsThreeVertical
                                  weight="bold"
                                  className="size-5"
                                />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-56 rounded-[1.5rem] border-border/40 bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl"
                            >
                              <DropdownMenuItem
                                asChild
                                className="cursor-pointer rounded-xl px-3 py-2.5 text-[10px] font-bold uppercase tracking-tight focus:bg-brand-primary/10 focus:text-brand-primary"
                              >
                                <Link
                                  href={{
                                    pathname: "/admin/clients/[id]",
                                    params: { id: user.id },
                                  }}
                                >
                                  <ArrowSquareOut className="mr-2 size-4" />{" "}
                                  {t("table.inspect")}
                                </Link>
                              </DropdownMenuItem>

                              <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    onSelect={(event) => event.preventDefault()}
                                    className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight text-destructive focus:bg-destructive/10 focus:text-destructive"
                                  >
                                    <WarningOctagon className="mr-2 size-4" />{" "}
                                    Excluir
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent
                                  size="default"
                                  className="max-w-xl rounded-4xl border border-border/40 bg-background p-7 text-foreground shadow-2xl shadow-foreground/10 sm:max-w-xl"
                                >
                                  <AlertDialogHeader className="gap-4 text-left sm:text-left">
                                    <AlertDialogTitle className="font-heading text-2xl font-black uppercase tracking-tight text-foreground">
                                      Remover cliente do sistema
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="max-w-none text-sm leading-relaxed text-muted-foreground/75">
                                      Isso remove o usuario do Clerk, encerra o
                                      acesso ao painel e apaga o cadastro local.
                                      Projetos vinculados tambem serao removidos
                                      por cascata.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <div className="grid gap-3 rounded-[1.5rem] border border-border/30 bg-muted/30 p-4 text-sm text-foreground/80">
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/55">
                                        Cliente
                                      </span>
                                      <span className="text-right font-black uppercase">
                                        {user.firstName} {user.lastName}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/55">
                                        Projetos vinculados
                                      </span>
                                      <span className="font-black">
                                        {user.projectCount}
                                      </span>
                                    </div>
                                  </div>

                                  <AlertDialogFooter className="pt-2">
                                    <AlertDialogCancel className="rounded-full border-border/30 bg-background">
                                      Cancelar
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(user.id)}
                                      disabled={pendingDeletion}
                                      className="rounded-full bg-red-500 text-white hover:bg-red-500/90"
                                    >
                                      Confirmar exclusao
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/15 px-8 py-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            {t("summary", { count: filteredUsers.length })}
          </p>
        </div>
      </div>
    </div>
  )
}
