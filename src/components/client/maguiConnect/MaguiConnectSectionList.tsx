"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ArrowsDownUp, DotsSix, Plus, Trash } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import { Textarea } from "@/src/components/ui/textarea"

import {
  createOwnMaguiConnectSectionAction,
  deleteOwnMaguiConnectSectionAction,
  reorderOwnMaguiConnectSectionsAction,
  updateOwnMaguiConnectSectionAction,
} from "@/src/lib/actions/maguiConnect.actions"

interface MaguiConnectSectionListProps {
  sections: Array<{
    id: string
    title: string
    description: string | null
    isActive: boolean
    isCollapsible: boolean
  }>
}

export function MaguiConnectSectionList({
  sections,
}: MaguiConnectSectionListProps) {
  const t = useTranslations("MaguiConnect")
  const router = useRouter()
  const [items, setItems] = React.useState(sections)
  const [isAdding, setIsAdding] = React.useState(false)
  const [newTitle, setNewTitle] = React.useState("")
  const [newDescription, setNewDescription] = React.useState("")
  const [newIsCollapsible, setNewIsCollapsible] = React.useState(false)

  React.useEffect(() => {
    setItems(sections)
  }, [sections])

  const sensors = useSensors(useSensor(PointerSensor))

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((item) => item.id === active.id)
    const newIndex = items.findIndex((item) => item.id === over.id)
    const nextItems = arrayMove(items, oldIndex, newIndex)
    setItems(nextItems)
    await reorderOwnMaguiConnectSectionsAction(nextItems.map((item) => item.id))
  }

  const handleAdd = async () => {
    if (!newTitle) return
    try {
      const created = await createOwnMaguiConnectSectionAction({
        title: newTitle,
        description: newDescription,
        isActive: true,
        isCollapsible: newIsCollapsible,
      })
      setItems((current) => [...current, created])
      setNewTitle("")
      setNewDescription("")
      setNewIsCollapsible(false)
      setIsAdding(false)
      router.refresh()
      toast.success("Grupo criado com sucesso")
    } catch (error) {
      toast.error("Erro ao criar grupo")
    }
  }

  return (
    <div className="max-w-4xl space-y-12 pt-16 border-t border-border/40">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-black tracking-tight">Grupos de Links</h3>
          <p className="text-sm text-muted-foreground/60">
            Organize seus links em categorias (Ex: Redes Sociais, Contato).
          </p>
        </div>

        {!isAdding && (
          <button
            className="group relative inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-foreground px-8 text-[11px] font-black uppercase tracking-[0.2em] text-background transition-all hover:opacity-90 active:scale-[0.98] shadow-none overflow-hidden"
            type="button"
            onClick={() => setIsAdding(true)}
          >
            <div className="relative z-10 flex items-center gap-2">
              <Plus size={18} weight="bold" />
              Novo Grupo
            </div>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300 bg-muted/5 p-8 rounded-3xl border border-border/40">
          <div className="grid gap-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
              Nome do Grupo
            </Label>
            <Input
              autoFocus
              className="h-12 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-lg font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
              placeholder="Ex: Redes Sociais"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
              {t("groupDescriptionLabel")}
            </Label>
            <Textarea
              className="min-h-24 rounded-2xl border-border/40 bg-transparent shadow-none"
              placeholder={t("groupDescriptionPlaceholder")}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="is-collapsible"
              checked={newIsCollapsible}
              onCheckedChange={setNewIsCollapsible}
            />
            <Label
              htmlFor="is-collapsible"
              className="text-xs font-bold text-muted-foreground/60"
            >
              Transformar em Grupo Colapsável
            </Label>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="ghost"
              className="rounded-full px-6"
              onClick={() => setIsAdding(false)}
            >
              Cancelar
            </Button>
            <Button
              className="rounded-full bg-brand-primary px-8 text-white"
              onClick={handleAdd}
            >
              Criar Grupo
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {items.length > 1 && (
          <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/30">
            <ArrowsDownUp size={12} weight="bold" />
            Arraste para reordenar os grupos
          </div>
        )}

        <DndContext
          collisionDetection={closestCenter}
          sensors={sensors}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={items.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid gap-4">
              {items.length === 0 && !isAdding ? (
                <div className="py-12 text-center border-2 border-dashed border-border/20 rounded-3xl">
                  <p className="text-sm text-muted-foreground/40 font-medium">
                    Nenhum grupo criado ainda.
                  </p>
                </div>
              ) : (
                items.map((section) => (
                  <SectionItem
                    key={section.id}
                    section={section}
                    onDelete={() => {
                      setItems((current) =>
                        current.filter((item) => item.id !== section.id)
                      )
                      router.refresh()
                    }}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  )
}

function SectionItem({
  section,
  onDelete,
}: {
  section: {
    id: string
    title: string
    description: string | null
    isActive: boolean
    isCollapsible: boolean
  }
  onDelete: () => void
}) {
  const t = useTranslations("MaguiConnect")
  const router = useRouter()
  const [title, setTitle] = React.useState(section.title)
  const [description, setDescription] = React.useState(
    section.description ?? ""
  )
  const [isEditing, setIsEditing] = React.useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleUpdate = async () => {
    try {
      await updateOwnMaguiConnectSectionAction(section.id, {
        title,
        description,
        isActive: section.isActive,
        isCollapsible: section.isCollapsible,
      })
      setIsEditing(false)
      router.refresh()
      toast.success("Grupo atualizado")
    } catch (error) {
      toast.error("Erro ao atualizar grupo")
    }
  }

  const toggleCollapsible = async () => {
    try {
      await updateOwnMaguiConnectSectionAction(section.id, {
        title: section.title,
        description: section.description,
        isActive: section.isActive,
        isCollapsible: !section.isCollapsible,
      })
      router.refresh()
      toast.success("Configuração de grupo atualizada")
    } catch (error) {
      toast.error("Erro ao atualizar grupo")
    }
  }

  const handleDelete = async () => {
    if (!confirm("Tem certeza? Links associados ficarao sem grupo.")) return
    try {
      await deleteOwnMaguiConnectSectionAction(section.id)
      onDelete()
      toast.success("Grupo removido")
    } catch (error) {
      toast.error("Erro ao remover grupo")
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex items-center gap-6 bg-background/40 p-6 transition-all hover:bg-muted/5 border border-border/20 rounded-3xl",
        isDragging && "z-50 border-brand-primary/40 bg-background/80 opacity-50"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/20 transition-colors group-hover:text-muted-foreground/40"
      >
        <DotsSix size={24} weight="bold" />
      </div>

      <div className="flex-1 space-y-1">
        {isEditing ? (
          <div className="space-y-3">
            <Input
              autoFocus
              className="h-10 rounded-none border-0 border-b border-brand-primary bg-transparent px-0 text-base font-bold shadow-none focus-visible:ring-0 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              className="min-h-20 rounded-2xl border-border/40 bg-transparent shadow-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                className="rounded-full px-4"
                size="sm"
                onClick={handleUpdate}
              >
                {t("save")}
              </Button>
              <Button
                className="rounded-full px-4"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setTitle(section.title)
                  setDescription(section.description ?? "")
                  setIsEditing(false)
                }}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h4
              className="text-sm font-black uppercase tracking-[0.2em] text-foreground cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              {title}
            </h4>
            {section.description ? (
              <p className="text-xs leading-relaxed text-muted-foreground/60">
                {section.description}
              </p>
            ) : null}
          </div>
        )}
        <p className="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-widest">
          {section.isCollapsible ? "Colapsável" : "Lista Fixa"}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
            {t("isCollapsibleLabel")}
          </Label>
          <Switch
            checked={section.isCollapsible}
            onCheckedChange={toggleCollapsible}
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full text-muted-foreground/20 hover:text-red-500 hover:bg-red-500/5 transition-all"
          onClick={handleDelete}
        >
          <Trash size={18} weight="bold" />
        </Button>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
