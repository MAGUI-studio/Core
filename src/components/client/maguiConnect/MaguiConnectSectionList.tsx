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
import {
  ArrowsDownUp,
  DotsSix,
  Pencil,
  Plus,
  Trash,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/src/components/ui/alert-dialog"
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
    <div className="w-full max-w-4xl space-y-12 pt-12 sm:pt-16 border-t border-border/40 overflow-hidden">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-black tracking-tight">
            Grupos de Links
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground/60">
            Organize seus links em categorias (Ex: Redes Sociais, Contato).
          </p>
        </div>

        {!isAdding && (
          <button
            className="group relative inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full bg-foreground px-6 sm:px-8 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-background transition-all hover:opacity-90 active:scale-[0.98] shadow-none overflow-hidden"
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
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300 bg-muted/5 p-6 sm:p-8 rounded-3xl border border-border/40">
          <div className="grid gap-3">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary/60">
              Nome do Grupo
            </Label>
            <Input
              autoFocus
              className="h-12 rounded-none border-0 border-b border-border/60 bg-transparent px-0 text-base sm:text-lg font-normal shadow-none placeholder:text-foreground/30 focus-visible:border-brand-primary focus-visible:ring-0 transition-all"
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
              className="min-h-20 sm:min-h-24 rounded-2xl border-border/40 bg-transparent shadow-none text-sm sm:text-base"
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
              className="text-[10px] sm:text-xs font-bold text-muted-foreground/60 uppercase tracking-wider"
            >
              Transformar em Grupo Colapsável
            </Label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <Button
              variant="ghost"
              className="w-full sm:w-auto rounded-full px-6 text-[10px] uppercase tracking-widest order-2 sm:order-1"
              onClick={() => setIsAdding(false)}
            >
              Cancelar
            </Button>
            <Button
              className="w-full sm:w-auto rounded-full bg-brand-primary px-8 text-[10px] font-black uppercase tracking-widest text-white order-1 sm:order-2"
              onClick={handleAdd}
            >
              Criar Grupo
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {items.length > 1 && (
          <div className="flex items-center justify-end gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/30">
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
                <div className="py-12 sm:py-16 text-center border-2 border-dashed border-border/20 rounded-3xl">
                  <p className="text-xs sm:text-sm text-muted-foreground/40 font-medium">
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
        "group relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-background/40 p-5 sm:p-6 transition-all hover:bg-muted/5 border border-border/20 rounded-3xl",
        isDragging && "z-50 border-brand-primary/40 bg-background/80 opacity-50"
      )}
    >
      <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-muted-foreground/20 transition-colors group-hover:text-muted-foreground/40 shrink-0"
        >
          <DotsSix size={24} weight="bold" />
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-brand-primary/60">
                  Nome do Grupo
                </Label>
                <Input
                  autoFocus
                  className="h-10 rounded-none border-0 border-b border-brand-primary bg-transparent px-0 text-base font-bold shadow-none focus-visible:ring-0 transition-all"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-widest text-brand-primary/60">
                  Descrição
                </Label>
                <Textarea
                  className="min-h-20 rounded-2xl border-border/40 bg-transparent shadow-none text-sm"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  className="w-full sm:w-auto rounded-full px-6"
                  size="sm"
                  onClick={handleUpdate}
                >
                  {t("save")}
                </Button>
                <Button
                  className="w-full sm:w-auto rounded-full px-6"
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
            <div className="space-y-1">
              <h4
                className="text-sm font-black uppercase tracking-[0.2em] text-foreground cursor-pointer truncate"
                onClick={() => setIsEditing(true)}
              >
                {title}
              </h4>
              {section.description ? (
                <p className="text-xs leading-relaxed text-muted-foreground/60 line-clamp-2">
                  {section.description}
                </p>
              ) : null}
            </div>
          )}
          <p className="text-[9px] font-medium text-muted-foreground/40 uppercase tracking-widest">
            {section.isCollapsible ? "Colapsável" : "Lista Fixa"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 sm:gap-4 shrink-0 border-t border-border/5 sm:border-0 pt-4 sm:pt-0">
        <div className="flex items-center gap-2 mr-auto sm:mr-0">
          <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 whitespace-nowrap">
            {t("isCollapsibleLabel")}
          </Label>
          <Switch
            checked={section.isCollapsible}
            onCheckedChange={toggleCollapsible}
            className="scale-90"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 sm:h-9 sm:w-9 rounded-full text-muted-foreground/20 hover:text-brand-primary hover:bg-brand-primary/5 transition-all bg-muted/5 sm:bg-transparent"
          onClick={() => setIsEditing(true)}
        >
          <Pencil size={18} weight="bold" />
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-9 sm:w-9 rounded-full text-muted-foreground/20 hover:text-red-500 hover:bg-red-500/5 transition-all bg-muted/5 sm:bg-transparent"
            >
              <Trash size={18} weight="bold" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-[95vw] max-w-md rounded-3xl border-border/60 bg-background/95 backdrop-blur-xl p-6 sm:p-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-heading text-xl font-black uppercase tracking-tight">
                Remover este grupo?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm font-medium text-muted-foreground/60 leading-relaxed">
                Tem certeza que deseja remover este grupo de links? Links
                associados ficarão sem grupo. Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-3 mt-8">
              <AlertDialogCancel className="w-full sm:w-auto rounded-full border-border/40 text-xs font-bold uppercase tracking-widest hover:bg-muted/10 h-12 px-8 order-2 sm:order-1">
                {t("cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="w-full sm:w-auto rounded-full bg-red-500 text-xs font-bold uppercase tracking-widest text-white hover:bg-red-600 shadow-lg shadow-red-500/20 h-12 px-8 order-1 sm:order-2"
              >
                {t("delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
