import * as React from "react"

import { notFound } from "next/navigation"

import { Link } from "@/src/i18n/navigation"
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/src/components/ui/button"

import { ServiceCategoryForm } from "@/src/components/admin/service-categories/ServiceCategoryForm"

import { updateServiceCategoryAction } from "@/src/lib/actions/service-categories.actions"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Editar categoria de servico",
  description: "Edicao de categoria de servico.",
  path: "/admin/service-categories",
})

interface ServiceCategoryDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function ServiceCategoryDetailPage({
  params,
}: ServiceCategoryDetailPageProps): Promise<React.JSX.Element> {
  await protect("admin")

  const { id } = await params

  const category = await prisma.serviceCategory.findUnique({
    where: { id },
  })

  if (!category) {
    notFound()
  }

  return (
    <main className="relative flex flex-col gap-10 overflow-hidden bg-background/50 p-6 lg:p-12">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="flex flex-col gap-4">
        <Button
          asChild
          variant="ghost"
          className="h-10 w-fit rounded-full px-4 text-[10px] font-black uppercase tracking-[0.2em]"
        >
          <Link href="/admin/service-categories">
            <ArrowLeft className="mr-2 size-4" weight="bold" />
            Voltar
          </Link>
        </Button>

        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
            Catalogo de servicos
          </p>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-6xl">
            {category.name}
          </h1>
          <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground/80">
            Ajuste nome, descricao, abordagem, valor e imagem desta categoria.
          </p>
        </div>
      </div>

      <div className="w-full">
        <ServiceCategoryForm
          action={updateServiceCategoryAction}
          submitLabel="Salvar alteracoes"
          initialValues={{
            id: category.id,
            name: category.name,
            description: category.description ?? "",
            approach: category.approach,
            suggestedValue: category.suggestedValue,
            imageUrl: category.imageUrl ?? "",
            isSubscription: category.isSubscription,
          }}
        />
      </div>
    </main>
  )
}
