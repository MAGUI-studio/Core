import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import { PencilSimple, Plus, Tag } from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card } from "@/src/components/ui/card"
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
  return (
    <Card className="overflow-hidden rounded-3xl border-border/30 bg-muted/10 backdrop-blur-md">
      <Table>
        <TableHeader className="bg-muted/20">
          <TableRow className="border-border/30 hover:bg-transparent">
            <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Categoria
            </TableHead>
            <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Descricao
            </TableHead>
            <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Valor
            </TableHead>
            <TableHead className="h-16 px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Tipo
            </TableHead>
            <TableHead className="h-16 px-8 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Acoes
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/40"
              >
                Nenhuma categoria cadastrada.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow
                key={category.id}
                className="border-border/20 transition-all hover:bg-brand-primary/[0.03]"
              >
                <TableCell className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
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
                  <p className="text-sm font-black text-foreground">
                    {formatCurrencyBRLFromCents(category.suggestedValue)}
                  </p>
                </TableCell>
                <TableCell className="px-8 py-6">
                  <Badge
                    variant="secondary"
                    className="border-brand-primary/20 bg-brand-primary/5 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-brand-primary"
                  >
                    {category.isSubscription ? "Assinatura" : "Projeto"}
                  </Badge>
                </TableCell>
                <TableCell className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="h-10 rounded-full px-5 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Link
                        href={{
                          pathname: "/admin/service-categories/[id]",
                          params: { id: category.id },
                        }}
                      >
                        <PencilSimple className="mr-2 size-4" weight="bold" />
                        Editar
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <div className="border-t border-border/20 bg-background/40 px-6 py-4 sm:hidden">
        <Button
          asChild
          className="h-11 w-full rounded-full font-black uppercase tracking-[0.2em]"
        >
          <Link href="/admin/service-categories/new">
            <Plus className="mr-2 size-4" weight="bold" />
            Nova categoria
          </Link>
        </Button>
      </div>
    </Card>
  )
}
