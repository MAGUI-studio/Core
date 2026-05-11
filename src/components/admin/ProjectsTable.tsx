"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { Link } from "@/src/i18n/navigation"
import {
  MagnifyingGlass,
  ProjectorScreen,
  Trash,
  WarningOctagon,
} from "@phosphor-icons/react"
import { toast } from "sonner"

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
      <div className="relative flex-1 group">
        <MagnifyingGlass
          weight="duotone"
          className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand-primary"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar projetos..."
          className="h-14 rounded-2xl border-border/40 bg-muted/20 pl-12 pr-4 font-sans font-bold transition-all focus-visible:ring-brand-primary/20 focus-visible:bg-muted/30"
        />
      </div>

      <Card className="overflow-hidden rounded-3xl border-border/40 bg-muted/10 backdrop-blur-md">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow className="hover:bg-transparent border-border/40">
              <TableHead className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Projeto
              </TableHead>
              <TableHead className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Cliente
              </TableHead>
              <TableHead className="px-8 h-16 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Status / Progresso
              </TableHead>
              <TableHead className="px-8 h-16 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {commonT("actions")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/40"
                >
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow
                  key={project.id}
                  className="group border-border/20 transition-all hover:bg-brand-primary/[0.03]"
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
                        <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                          Criado em{" "}
                          {new Date(project.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-foreground uppercase">
                        {project.client.name || "Sem nome"}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {project.client.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <div className="flex flex-col gap-2 min-w-[140px]">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-brand-primary/5 text-brand-primary border-brand-primary/20 text-[8px] font-black uppercase tracking-widest py-0.5 px-2"
                        >
                          {t(project.status)}
                        </Badge>
                        <span className="text-[10px] font-black text-brand-primary/60">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                        <div
                          className="h-full bg-brand-primary transition-all duration-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="h-10 rounded-2xl px-5 text-[10px] font-black uppercase tracking-widest"
                      >
                        <Link
                          href={{
                            pathname: "/admin/clients/[id]",
                            params: { id: project.client.id },
                          }}
                        >
                          Cliente
                        </Link>
                      </Button>

                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-10 rounded-2xl px-6 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-brand-primary hover:text-white"
                      >
                        <Link
                          href={{
                            pathname: "/admin/projects/[id]",
                            params: { id: project.id },
                          }}
                        >
                          {commonT("inspect")}
                        </Link>
                      </Button>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-10 rounded-2xl border-red-500/20 px-5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10"
                          >
                            <Trash className="mr-2 size-4" weight="bold" />
                            Excluir
                          </Button>
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
                              Essa acao remove o projeto e todos os registros
                              vinculados por cascata, incluindo updates, assets,
                              action items, versoes, notificacoes e logs.
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
                              <Button variant="outline" className="rounded-2xl">
                                Cancelar
                              </Button>
                            </DialogClose>
                            <Button
                              onClick={() => handleDelete(project.id)}
                              disabled={pendingDeletion}
                              className="rounded-2xl bg-red-500 hover:bg-red-500/90"
                            >
                              Confirmar exclusão
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
