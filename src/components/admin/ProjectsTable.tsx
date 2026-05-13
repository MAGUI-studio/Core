"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link } from "@/src/i18n/navigation"
import {
  ArrowSquareOut,
  DotsThreeVertical,
  MagnifyingGlass,
  ProjectorScreen,
  Trash,
  User,
  WarningOctagon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
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

import { deleteProjectAction } from "@/src/lib/actions/project.actions"

export interface ProjectData {
  id: string
  name: string
  status: string
  progress: number
  client: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
}

interface ProjectsTableProps {
  initialProjects: ProjectData[]
}

export function ProjectsTable({ initialProjects }: ProjectsTableProps) {
  const t = useTranslations("Dashboard.status")
  const commonT = useTranslations("Admin.clients.table")
  const [projectItems, setProjectItems] = React.useState(initialProjects)
  const [prevInitialProjects, setPrevInitialProjects] =
    React.useState(initialProjects)
  const [search, setSearch] = React.useState("")
  const [pendingDeletion, startDeletion] = React.useTransition()

  if (initialProjects !== prevInitialProjects) {
    setPrevInitialProjects(initialProjects)
    setProjectItems(initialProjects)
  }

  const filteredProjects = React.useMemo(() => {
    if (!search) return projectItems
    const query = search.toLowerCase()
    return projectItems.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.client.name?.toLowerCase() || "").includes(query) ||
        p.client.email.toLowerCase().includes(query)
    )
  }, [projectItems, search])

  const handleDelete = (projectId: string) => {
    startDeletion(async () => {
      const result = await deleteProjectAction(projectId)

      if (result.success) {
        toast.success("Projeto removido com sucesso.")
        setProjectItems((current) =>
          current.filter((project) => project.id !== projectId)
        )
        return
      }

      toast.error(result.error ?? "Nao foi possivel remover o projeto.")
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="group relative flex-1">
        <MagnifyingGlass
          weight="bold"
          className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-primary"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar projetos..."
          className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-11 pr-4 text-xs font-bold transition-all focus-visible:bg-muted/20 focus-visible:ring-brand-primary/20"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Projeto
              </TableHead>
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Cliente
              </TableHead>
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Status / Progresso
              </TableHead>
              <TableHead className="h-16 px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                {commonT("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-48 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30"
                >
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="group border-border/15 transition-all hover:bg-brand-primary/[0.02]"
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                        <ProjectorScreen weight="duotone" className="size-6" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-heading text-sm font-black uppercase tracking-tight text-foreground">
                          {project.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                          Criado em{" "}
                          {new Date(project.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[11px] font-bold text-foreground/80">
                        {project.client.name || "Sem nome"}
                      </span>
                      <span className="text-[9px] font-black tracking-widest text-muted-foreground/40 uppercase">
                        {project.client.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex min-w-[140px] flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="secondary"
                          className="border-brand-primary/20 bg-brand-primary/5 px-2 py-0.5 text-[8px] font-black uppercase text-brand-primary"
                        >
                          {t(project.status)}
                        </Badge>
                        <span className="text-[10px] font-black text-brand-primary/60">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
                        <div
                          className="h-full bg-brand-primary transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-9 rounded-full text-muted-foreground/40 hover:bg-brand-primary/10 hover:text-brand-primary"
                        title={commonT("inspect")}
                      >
                        <Link
                          href={{
                            pathname: "/admin/projects/[id]",
                            params: { id: project.id },
                          }}
                        >
                          <ArrowSquareOut weight="bold" size={16} />
                        </Link>
                      </Button>

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
                                params: { id: project.client.id },
                              }}
                            >
                              <User className="mr-2 size-4" /> Cliente
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="my-1.5 bg-border/40" />

                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(event) => event.preventDefault()}
                                className="cursor-pointer rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-tight text-destructive focus:bg-destructive/10 focus:text-destructive"
                              >
                                <Trash className="mr-2 size-4" /> Excluir
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl rounded-4xl">
                              <DialogHeader>
                                <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
                                  <WarningOctagon
                                    className="size-6"
                                    weight="fill"
                                  />
                                </div>
                                <DialogTitle className="font-heading text-2xl font-black uppercase tracking-tight">
                                  Remover projeto
                                </DialogTitle>
                                <DialogDescription>
                                  Essa acao remove o projeto e todos os
                                  registros vinculados por cascata, incluindo
                                  updates, assets, action items, versoes,
                                  notificacoes e logs.
                                </DialogDescription>
                              </DialogHeader>

                              <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm leading-relaxed text-foreground/75">
                                Projeto:{" "}
                                <span className="font-black uppercase">
                                  {project.name}
                                </span>
                                <br />
                                Cliente:{" "}
                                <span className="font-black">
                                  {project.client.name || project.client.email}
                                </span>
                              </div>

                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button
                                    variant="outline"
                                    className="rounded-2xl"
                                  >
                                    Cancelar
                                  </Button>
                                </DialogClose>
                                <Button
                                  onClick={() => handleDelete(project.id)}
                                  disabled={pendingDeletion}
                                  className="rounded-2xl bg-red-500 hover:bg-red-500/90"
                                >
                                  Confirmar exclusao
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/15 px-8 py-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            {filteredProjects.length} projeto(s) encontrado(s)
          </p>
        </div>
      </div>
    </div>
  )
}
