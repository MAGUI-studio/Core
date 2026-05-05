"use client"

import * as React from "react"

import { useRouter } from "@/src/i18n/navigation"
import { Plus } from "@phosphor-icons/react"

import { Button } from "@/src/components/ui/button"

interface CreateProposalDrawerProps {
  leadId: string
}

export function CreateProposalDrawer({
  leadId,
}: CreateProposalDrawerProps): React.JSX.Element {
  const router = useRouter()

  return (
    <Button
      onClick={() =>
        router.push({
          pathname: "/admin/crm/proposals/new",
          query: { leadId },
        })
      }
      className="rounded-full bg-brand-primary px-5 text-[10px] font-black uppercase tracking-[0.18em] text-white shadow-xl shadow-brand-primary/10 transition-all hover:scale-105 hover:bg-brand-primary/90 active:scale-95"
    >
      <Plus className="mr-2 size-4" weight="bold" /> Nova Proposta
    </Button>
  )
}
