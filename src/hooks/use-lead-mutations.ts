import * as React from "react"

import { LeadStatus } from "@/src/generated/client"
import { Lead } from "@/src/types/crm"
import { toast } from "sonner"

import {
  addLeadNote,
  updateLead,
  updateLeadStatus,
} from "@/src/lib/actions/crm.actions"

export function useLeadMutations(
  initialLead: Lead,
  onLeadUpdated?: (lead: Lead) => void
) {
  const [localLead, setLocalLead] = React.useState(initialLead)
  const [prevInitialLead, setPrevInitialLead] = React.useState(initialLead)

  if (initialLead !== prevInitialLead) {
    setPrevInitialLead(initialLead)
    setLocalLead(initialLead)
  }

  const [isUpdatingStatus, setIsUpdatingStatus] =
    React.useState<LeadStatus | null>(null)
  const [isSavingNote, setIsSavingNote] = React.useState(false)
  const [isSavingLead, setIsSavingLead] = React.useState(false)

  const commitLead = React.useCallback(
    (nextLead: Lead) => {
      setLocalLead(nextLead)
      onLeadUpdated?.(nextLead)
    },
    [onLeadUpdated]
  )

  const handleStatusChange = async (status: LeadStatus) => {
    setIsUpdatingStatus(status)
    const result = await updateLeadStatus(localLead.id, status)

    if (result.success) {
      const nextLead: Lead = {
        ...localLead,
        status,
        updatedAt: new Date().toISOString(),
      }
      commitLead(nextLead)
      toast.success("Status atualizado.")
    } else {
      toast.error("Erro ao atualizar status.")
    }
    setIsUpdatingStatus(null)
  }

  const handleAddNote = async (content: string) => {
    setIsSavingNote(true)
    const result = await addLeadNote({
      leadId: localLead.id,
      content,
    })

    if (result.success) {
      const nextLead: Lead = {
        ...localLead,
        updatedAt: new Date().toISOString(),
      }
      commitLead(nextLead)
      toast.success("Nota registrada.")
      setIsSavingNote(false)
      return true
    } else {
      toast.error("Erro ao salvar nota.")
      setIsSavingNote(false)
      return false
    }
  }

  const handleSaveLead = async (formData: unknown) => {
    setIsSavingLead(true)
    const data = (formData as Record<string, unknown>) || {}

    const result = await updateLead({
      id: localLead.id,
      companyName: String(data.companyName || ""),
      contactName: String(data.contactName || ""),
      email: String(data.email || ""),
      phone: String(data.phone || ""),
      website: String(data.website || ""),
      instagram: String(data.instagram || ""),
      source: (data.source as unknown as Lead["source"]) || "OTHER",
    })

    if (result.success) {
      const nextLead: Lead = {
        ...localLead,
        ...data,
        updatedAt: new Date().toISOString(),
      } as Lead
      commitLead(nextLead)
      toast.success("Lead atualizado.")
      setIsSavingLead(false)
      return true
    } else {
      toast.error("Erro ao salvar lead.")
      setIsSavingLead(false)
      return false
    }
  }

  return {
    localLead,
    setLocalLead,
    isUpdatingStatus,
    isSavingNote,
    isSavingLead,
    handleStatusChange,
    handleAddNote,
    handleSaveLead,
  }
}
