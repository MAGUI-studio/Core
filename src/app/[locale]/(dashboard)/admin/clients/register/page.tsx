import * as React from "react"

import { getTranslations } from "next-intl/server"

import { CreateClientForm } from "@/src/components/admin/CreateClientForm"

import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Novo cliente",
  description: "Cadastro administrativo de novos clientes da MAGUI.studio.",
  path: "/admin/clients/register",
})

export default async function CreateClientPage(): Promise<React.JSX.Element> {
  const t = await getTranslations("Admin.clients")

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
          <CreateClientForm />
        </div>
      </div>
    </main>
  )
}
