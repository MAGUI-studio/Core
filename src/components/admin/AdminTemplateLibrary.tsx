"use client"

import * as React from "react"

import { MessageTemplate } from "@/src/types/crm"
import { Copy, FloppyDisk, Plus, Trash } from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"

import {
  deleteMessageTemplateAction,
  saveMessageTemplateAction,
} from "@/src/lib/actions/crm.actions"

const scopeLabels: Record<string, string> = {
  LEAD: "Comercial",
  UPDATE: "Updates",
  APPROVAL: "Aprovação",
  MATERIAL_REQUEST: "Solicitação de material",
  ONBOARDING: "Onboarding",
}

const scopes = Object.keys(scopeLabels)

export function AdminTemplateLibrary({
  templates,
}: {
  templates: MessageTemplate[]
}): React.JSX.Element {
  const [templateItems, setTemplateItems] = React.useState(templates)
  const [activeScope, setActiveScope] = React.useState("LEAD")
  const [name, setName] = React.useState("")
  const [content, setContent] = React.useState("")
  const [isSaving, startSaving] = React.useTransition()
  const [isDeleting, startDeleting] = React.useTransition()

  React.useEffect(() => {
    setTemplateItems(templates)
  }, [templates])

  const visibleTemplates = templateItems.filter(
    (template) => template.scope === activeScope
  )

  const handleSave = () => {
    if (!name.trim() || !content.trim()) {
      toast.error("Preencha nome e conteúdo do template.")
      return
    }

    startSaving(async () => {
      const result = await saveMessageTemplateAction({
        name: name.trim(),
        content: content.trim(),
        scope: activeScope,
      })

      if (result.success) {
        toast.success("Template salvo com sucesso.")
        if (result.template) {
          setTemplateItems((current) => [result.template!, ...current])
        }
        setName("")
        setContent("")
      } else {
        toast.error(result.error || "Erro ao salvar template.")
      }
    })
  }

  const handleDelete = (id: string) => {
    startDeleting(async () => {
      const result = await deleteMessageTemplateAction(id)

      if (result.success) {
        toast.success("Template removido.")
        setTemplateItems((current) =>
          current.filter((template) => template.id !== id)
        )
      } else {
        toast.error(result.error || "Erro ao remover template.")
      }
    })
  }

  const handleCopy = async (template: MessageTemplate) => {
    await navigator.clipboard.writeText(template.content)
    toast.success(`Template "${template.name}" copiado.`)
  }

  return (
    <section className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        {scopes.map((scope) => (
          <Button
            key={scope}
            type="button"
            variant={activeScope === scope ? "default" : "outline"}
            className="rounded-full px-4 text-[10px] font-black uppercase tracking-[0.18em]"
            onClick={() => setActiveScope(scope)}
          >
            {scopeLabels[scope]}
            <span className="ml-2 text-[9px] opacity-70">
              {templateItems.filter((item) => item.scope === scope).length}
            </span>
          </Button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="grid gap-4">
          {visibleTemplates.length === 0 ? (
            <div className="rounded-[1.5rem] border border-dashed border-border/35 bg-background/40 px-5 py-10 text-center text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/45">
              Nenhum template cadastrado para esse escopo.
            </div>
          ) : (
            visibleTemplates.map((template) => (
              <div
                key={template.id}
                className="rounded-[1.5rem] border border-border/30 bg-background/60 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-base font-black tracking-tight text-foreground">
                      {template.name}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground/75">
                      {template.content}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-full"
                      onClick={() => handleCopy(template)}
                    >
                      <Copy className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="rounded-full text-rose-600 dark:text-rose-300"
                      disabled={isDeleting}
                      onClick={() => handleDelete(template.id)}
                    >
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid gap-4 rounded-[1.5rem] border border-border/30 bg-background/60 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-muted-foreground/45">
              Novo template
            </p>
            <p className="mt-2 text-sm text-muted-foreground/70">
              Use este escopo para padronizar mensagens internas e acelerar a
              operação.
            </p>
          </div>

          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome do template"
            className="h-12 rounded-2xl"
          />

          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Escreva o conteúdo base do template..."
            className="min-h-[180px] rounded-2xl"
          />

          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-full text-[10px] font-black uppercase tracking-[0.18em]"
          >
            {isSaving ? (
              <>
                <FloppyDisk className="mr-2 size-4" />
                Salvando
              </>
            ) : (
              <>
                <Plus className="mr-2 size-4" />
                Salvar template
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
