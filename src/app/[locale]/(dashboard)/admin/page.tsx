import * as React from "react"

import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth } from "@clerk/nextjs/server"

import { Button } from "@/src/components/ui/button"

import { Logo } from "@/src/components/common/logo"

import { isAdmin } from "@/src/lib/permissions"
import { dashboardMetadata } from "@/src/lib/seo"

export const metadata = dashboardMetadata({
  title: "Admin",
  description:
    "Area administrativa da MAGUI.studio para gestao de clientes, projetos e CRM.",
  path: "/admin",
})

export default async function AdminPage(): Promise<React.JSX.Element> {
  if (!(await isAdmin())) {
    redirect("/")
  }

  const t = await getTranslations("Admin")
  const { sessionClaims } = await auth()

  return (
    <main className="flex flex-col items-center justify-center gap-12 bg-background px-6">
      <Logo width={200} />

      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-brand-primary">
          {t("eyebrow")}
        </p>
        <h1 className="font-heading text-4xl font-black uppercase leading-[0.86] tracking-[-0.05em] sm:text-6xl lg:text-8xl">
          {t("title")}{" "}
          <span className="text-brand-primary">{t("subtitle")}</span>
        </h1>
      </div>

      <div className="w-full max-w-2xl rounded-2xl border border-border/60 bg-muted/20 p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Status
            </span>
            <span className="rounded-full bg-brand-primary/10 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-brand-primary">
              Authenticated
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
              Role
            </span>
            <span className="font-sans font-bold uppercase text-[11px] tracking-widest text-foreground">
              {sessionClaims?.metadata?.role || "member"}
            </span>
          </div>
        </div>

        <div className="mt-8">
          <Button
            asChild
            className="w-full rounded-full py-6 uppercase tracking-widest"
          >
            <Link href="/admin/clients">Gerenciar Clientes</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
