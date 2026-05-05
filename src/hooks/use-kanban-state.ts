import * as React from "react"

import { LeadStatus } from "@/src/generated/client"
import { Lead } from "@/src/types/crm"
import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { toast } from "sonner"

import { updateLeadStatus } from "@/src/lib/actions/crm.actions"
import { CRM_STATUS_ORDER } from "@/src/lib/utils/crm"

type LeadMap = Record<string, Lead>
type ColumnMap = Record<LeadStatus, string[]>

function buildBoardState(leads: Lead[]) {
  const ordered = [...leads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
  const leadMap = ordered.reduce<LeadMap>((acc, l) => {
    acc[l.id] = l
    return acc
  }, {})
  const columnMap = CRM_STATUS_ORDER.reduce<ColumnMap>((acc, status) => {
    acc[status] = ordered.filter((l) => l.status === status).map((l) => l.id)
    return acc
  }, {} as ColumnMap)
  return { leadMap, columnMap }
}

function findContainer(
  id: string,
  columnMap: ColumnMap
): LeadStatus | undefined {
  if (CRM_STATUS_ORDER.includes(id as LeadStatus)) return id as LeadStatus
  return CRM_STATUS_ORDER.find((status) => columnMap[status].includes(id))
}

export function useKanbanState(initialLeads: Lead[], onMove?: () => void) {
  const [boardState, setBoardState] = React.useState(() =>
    buildBoardState(initialLeads)
  )
  const [activeLeadId, setActiveLeadId] = React.useState<string | null>(null)
  const lastCommittedStatusRef = React.useRef<LeadStatus | null>(null)

  React.useEffect(() => {
    setBoardState(buildBoardState(initialLeads))
  }, [initialLeads])

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id)
    setActiveLeadId(id)
    lastCommittedStatusRef.current = boardState.leadMap[id]?.status ?? null
  }

  const handleDragOver = (event: DragOverEvent) => {
    const activeId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null
    if (!overId) return

    const activeContainer = findContainer(activeId, boardState.columnMap)
    const overContainer = findContainer(overId, boardState.columnMap)

    if (
      !activeContainer ||
      !overContainer ||
      activeContainer === overContainer ||
      overContainer === LeadStatus.CONVERTIDO
    )
      return

    setBoardState((curr) => {
      const activeItems = curr.columnMap[activeContainer]
      const overItems = curr.columnMap[overContainer]
      const overIndex =
        overId === overContainer ? overItems.length : overItems.indexOf(overId)
      const nextIndex = overIndex < 0 ? overItems.length : overIndex

      return {
        leadMap: {
          ...curr.leadMap,
          [activeId]: { ...curr.leadMap[activeId], status: overContainer },
        },
        columnMap: {
          ...curr.columnMap,
          [activeContainer]: activeItems.filter((id) => id !== activeId),
          [overContainer]: [
            ...overItems.slice(0, nextIndex),
            activeId,
            ...overItems.slice(nextIndex),
          ],
        },
      }
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const activeId = String(event.active.id)
    const overId = event.over?.id ? String(event.over.id) : null
    setActiveLeadId(null)

    if (!overId) {
      setBoardState(buildBoardState(initialLeads))
      return
    }

    const activeContainer = findContainer(activeId, boardState.columnMap)
    const overContainer = findContainer(overId, boardState.columnMap)

    if (!activeContainer || !overContainer) {
      setBoardState(buildBoardState(initialLeads))
      return
    }

    if (overContainer === LeadStatus.CONVERTIDO) {
      setBoardState(buildBoardState(initialLeads))
      toast.error(
        "Para converter o lead, utilize o botão de conversão no menu de detalhes."
      )
      return
    }

    if (activeContainer === overContainer) {
      const activeIndex =
        boardState.columnMap[activeContainer].indexOf(activeId)
      const overIndex =
        overId === overContainer
          ? boardState.columnMap[activeContainer].length - 1
          : boardState.columnMap[activeContainer].indexOf(overId)
      if (activeIndex !== overIndex && overIndex >= 0) {
        setBoardState((curr) => ({
          ...curr,
          columnMap: {
            ...curr.columnMap,
            [activeContainer]: arrayMove(
              curr.columnMap[activeContainer],
              activeIndex,
              overIndex
            ),
          },
        }))
      }
      return
    }

    const previousStatus = lastCommittedStatusRef.current
    if (!previousStatus || previousStatus === overContainer) return

    const result = await updateLeadStatus(activeId, overContainer)
    if (!result.success) {
      setBoardState(buildBoardState(initialLeads))
      toast.error("Erro ao mover lead.")
    } else {
      toast.success("Lead movido.")
      if (onMove) onMove()
    }
  }

  return {
    boardState,
    setBoardState,
    activeLeadId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  }
}
