import * as React from "react"

import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { auth } from "@clerk/nextjs/server"
import {
  CurrencyCircleDollar,
  LockKey,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr"

import { ClientProjectBreadcrumb } from "@/src/components/client/ClientProjectBreadcrumb"

import { getClientProjectBreadcrumb } from "@/src/lib/client-projects"
import prisma from "@/src/lib/prisma"
import { dashboardMetadata } from "@/src/lib/seo"
import { toHref } from "@/src/lib/utils/navigation"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    select: { name: true },
  })

  return dashboardMetadata({
    title: project?.name ?? "Projeto",
    description:
      "Area autenticada do projeto com timeline, aprovacoes, arquivos, briefing e tarefas.",
    path: `/projects/${id}`,
  })
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}): Promise<React.JSX.Element> {
  const { id } = await params
  const { userId } = await auth()
  const headerList = await headers()

  // Normalizing pathname check - accepting both internal and localized routes
  const fullPathname = headerList.get("x-pathname") || ""
  const isFinancialPage =
    fullPathname.includes("/financial") ||
    fullPathname.includes("/investimento") ||
    fullPathname.includes("/financial?") ||
    fullPathname.includes("/investimento?")

  if (!userId) return <div />

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  })

  if (!user) return <div />

  const project = await getClientProjectBreadcrumb(id, user.id)

  if (!project) return notFound()

  // LOCKDOWN LOGIC: Check if at least one installment is PAID across all invoices
  const allInstallments = project.invoices.flatMap((inv) => inv.installments)
  const isPaid = allInstallments.some((inst) => inst.status === "PAID")

  // Access is allowed if:
  // 1. User is Admin
  // 2. Project has at least one paid installment
  // 3. Current route is the financial page
  const canAccessFullProject =
    user.role === "ADMIN" || isPaid || isFinancialPage

  if (!canAccessFullProject) {
    return (
      <div className="flex min-h-full flex-col px-5 py-10 sm:px-6 lg:px-12 relative">
        <main className="mx-auto flex w-full max-w-440 flex-col gap-16">
          <ClientProjectBreadcrumb
            projectId={project.id}
            projectName={project.name}
          />

          <div className="relative overflow-hidden rounded-[3rem] border border-border/20 bg-muted/5 p-8 md:p-16 lg:p-20 shadow-2xl">
            <div className="absolute top-0 right-0 -z-10 size-96 translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-primary/5 blur-3xl opacity-50" />

            <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
              <div className="flex size-20 items-center justify-center rounded-4xl bg-brand-primary/10 text-brand-primary mb-4">
                <LockKey size={40} weight="duotone" />
              </div>

              <div className="space-y-4">
                <h2 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tight text-foreground">
                  Aguardando <br /> Ativação
                </h2>
                <p className="text-sm md:text-lg font-medium leading-relaxed text-muted-foreground/60 uppercase tracking-widest">
                  Para iniciarmos o desenvolvimento estratégico do seu projeto,
                  é necessário confirmar o pagamento da primeira parcela
                  acordada.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center pt-4">
                <a
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  href={toHref(`/projects/${project.id}/financial`) as any}
                  className="h-16 px-12 rounded-full bg-brand-primary text-white font-mono text-[11px] font-black uppercase tracking-[0.3em] flex items-center justify-center hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-brand-primary/20 w-full sm:w-auto gap-3"
                >
                  <CurrencyCircleDollar size={20} weight="fill" />
                  Ir para Pagamento
                </a>
              </div>

              <div className="pt-8 border-t border-border/10 w-full flex items-center justify-center gap-4">
                <ShieldCheck
                  size={18}
                  className="text-emerald-500/50"
                  weight="fill"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
                  Ambiente seguro e processamento automático
                </span>
              </div>
            </div>
          </div>

          <div className="opacity-10 pointer-events-none grayscale blur-md select-none overflow-hidden max-h-[400px]">
            {children}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col px-5 py-10 sm:px-6 lg:px-12 relative">
      <main className="mx-auto flex w-full max-w-440 flex-col">
        <ClientProjectBreadcrumb
          projectId={project.id}
          projectName={project.name}
        />
        {children}
      </main>
    </div>
  )
}
