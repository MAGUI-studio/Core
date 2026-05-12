"use client"

import * as React from "react"

import {
  ArrowSquareOut,
  MagnifyingGlass,
  Plus,
  Tag,
} from "@phosphor-icons/react"

import { Link } from "@/src/i18n/navigation"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"

import { formatCurrencyBRLFromCents } from "@/src/lib/utils/utils"

interface ServiceCategoriesTableProps {
  categories: {
    id: string
    name: string
    description: string | null
    approach: string
    suggestedValue: number
    imageUrl: string | null
    isSubscription: boolean
  }[]
}

export function ServiceCategoriesTable({
  categories,
}: ServiceCategoriesTableProps): React.JSX.Element {
  const [search, setSearch] = React.useState("")

  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return categories

    const query = search.toLowerCase()
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(query) ||
        (category.description ?? "").toLowerCase().includes(query) ||
        category.approach.toLowerCase().includes(query)
    )
  }, [categories, search])

  return (
    <div className="flex flex-col gap-6">
      <div className="group relative flex-1">
        <MagnifyingGlass
          weight="bold"
          className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-brand-primary"
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar categorias..."
          className="h-12 rounded-2xl border-border/40 bg-muted/10 pl-11 pr-4 text-xs font-bold transition-all focus-visible:bg-muted/20 focus-visible:ring-brand-primary/20"
        />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Categoria
              </TableHead>
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Descricao
              </TableHead>
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Valor
              </TableHead>
              <TableHead className="h-16 px-8 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Tipo
              </TableHead>
              <TableHead className="h-16 px-8 text-right text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
                Acoes
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-48 text-center text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30"
                >
                  Nenhuma categoria cadastrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
                <TableRow
                  key={category.id}
                  className="group border-border/15 transition-all hover:bg-brand-primary/[0.02]"
                >
                  <TableCell className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                        <Tag weight="duotone" className="size-6" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-heading text-sm font-black uppercase tracking-tight text-foreground">
                          {category.name}
                        </p>
                        <p className="mt-1 line-clamp-2 max-w-sm text-xs text-muted-foreground/70">
                          {category.approach}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <p className="line-clamp-3 max-w-md text-sm text-muted-foreground/80">
                      {category.description || "Sem descricao definida."}
                    </p>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <p className="text-xs font-black text-foreground/90">
                      {formatCurrencyBRLFromCents(category.suggestedValue)}
                    </p>
                  </TableCell>
                  <TableCell className="px-8 py-6">
                    <Badge
                      variant="secondary"
                      className="border-brand-primary/20 bg-brand-primary/5 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-brand-primary"
                    >
                      {category.isSubscription ? "Assinatura" : "Projeto"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-8 py-6 text-right">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-full text-muted-foreground/40 hover:bg-brand-primary/10 hover:text-brand-primary"
                      title="Editar categoria"
                    >
                      <Link
                        href={{
                          pathname: "/admin/service-categories/[id]",
                          params: { id: category.id },
                        }}
                      >
                        <ArrowSquareOut weight="bold" size={16} />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between border-t border-border/15 px-8 py-4">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
            {filteredCategories.length} categoria(s) encontrada(s)
          </p>
        </div>

        <div className="border-t border-border/20 bg-background/40 px-6 py-4 sm:hidden">
          <Button
            asChild
            className="h-11 w-full rounded-full font-black uppercase tracking-[0.2em] text-white"
          >
            <Link href="/admin/service-categories/new">
              <Plus className="mr-2 size-4" weight="bold" />
              Nova categoria
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
