import * as React from "react"

import { getTranslations } from "next-intl/server"

import { UserRole } from "@/src/generated/client"

import { CreateProjectForm } from "@/src/components/admin/CreateProjectForm"

import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Novo projeto",
  description:
    "Cadastro administrativo de novos projetos e clientes responsaveis.",
  path: "/admin/projects/register",
})

export default async function CreateProjectPage(): Promise<React.JSX.Element> {
  const t = await getTranslations("Admin.projects")

  const clients = await prisma.user.findMany({
    where: { role: UserRole.CLIENT },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: "asc" },
  })

  const serviceCategories = await prisma.serviceCategory.findMany({
    orderBy: { suggestedValue: "asc" },
  })

  return (
    <main className="relative flex flex-col bg-background/50 p-6 lg:p-12 overflow-hidden">
      <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />
      <div className="absolute bottom-0 left-0 -z-10 size-96 -translate-x-1/2 translate-y-1/2 rounded-full bg-brand-primary/10 blur-3xl opacity-30" />

      <div className="w-full flex flex-col gap-12">
        <div className="flex flex-col gap-3 text-left">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-brand-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary">
              {t("eyebrow")}
            </p>
          </div>
          <h1 className="font-heading text-4xl font-black uppercase tracking-[-0.05em] sm:text-7xl">
            {t("create")}
          </h1>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground/60 uppercase tracking-widest">
            {t("description")}
          </p>
        </div>

        <div className="w-full">
          <CreateProjectForm
            clients={clients}
            serviceCategories={serviceCategories}
          />
        </div>
      </div>
    </main>
  )
}
