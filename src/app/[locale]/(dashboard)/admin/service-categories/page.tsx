import * as React from "react"

import { Link } from "@/src/i18n/navigation"
import { FolderPlus } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { ServiceCategoriesTable } from "@/src/components/admin/service-categories/ServiceCategoriesTable"

import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Categorias de servico",
  description:
    "Gestao das categorias de servico usadas em projetos e checkout.",
  path: "/admin/service-categories",
})

export default async function ServiceCategoriesPage(): Promise<React.JSX.Element> {
  await protect("admin")

  const categories = await prisma.serviceCategory.findMany({
    orderBy: { suggestedValue: "asc" },
  })

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="size-2 animate-pulse rounded-full bg-brand-primary" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              Catalogo de servicos
            </p>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl lg:text-7xl">
            Categorias
          </h1>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/80">
            Lista central das categorias usadas na criacao de projeto e no
            checkout Stripe.
          </p>
        </div>

        <Button
          asChild
          className="group relative hidden h-14 overflow-hidden rounded-full px-10 font-sans font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-brand-primary/20 sm:inline-flex"
        >
          <Link
            href="/admin/service-categories/new"
            className="flex items-center gap-3"
          >
            <FolderPlus
              weight="duotone"
              className="size-5 transition-transform group-hover:rotate-12"
            />
            <span>Nova categoria</span>
          </Link>
        </Button>
      </div>

      <ServiceCategoriesTable categories={categories} />
    </main>
  )
}
