"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { AssetType } from "@/src/generated/client"
import {
  CheckCircle,
  File,
  FilePdf,
  Image as ImageIcon,
  Paperclip,
  PlusCircle,
  Spinner,
  Star,
  X,
} from "@phosphor-icons/react"
import { toast } from "sonner"

import { Button } from "@/src/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/src/components/ui/field"
import { InputGroup, InputGroupInput } from "@/src/components/ui/input-group"
import { Switch } from "@/src/components/ui/switch"
import { Textarea } from "@/src/components/ui/textarea"

import { addProjectTimelineAction } from "@/src/lib/actions/project.actions"
import { useUploadThing } from "@/src/lib/uploadthing"

interface AddTimelineFormProps {
  projectId: string
}

type TimelineAttachmentPayload = {
  name: string
  url: string
  key: string
  customId: string | null
  type: AssetType
  mimeType: string
  size: number
}

function formatBytes(size: number): string {
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function getAttachmentType(mimeType: string): AssetType {
  return mimeType.startsWith("image/") ? AssetType.IMAGE : AssetType.DOCUMENT
}

function SelectedFileIcon({ file }: { file: File }): React.JSX.Element {
  if (file.type.startsWith("image/")) {
    return <ImageIcon weight="duotone" className="size-5" />
  }

  if (file.type === "application/pdf") {
    return <FilePdf weight="duotone" className="size-5" />
  }

  return <File weight="duotone" className="size-5" />
}

export function AddTimelineForm({ projectId }: AddTimelineFormProps) {
  const t = useTranslations("Admin.projects.details.timeline_form")
  const [isPending, setIsPending] = React.useState(false)
  const [isMilestone, setIsMilestone] = React.useState(false)
  const [requiresApproval, setRequiresApproval] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const formRef = React.useRef<HTMLFormElement>(null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const { startUpload, isUploading } = useUploadThing("projectAsset")

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) {
      return
    }

    setSelectedFiles((currentFiles) => {
      const nextFiles = Array.from(event.target.files ?? [])
      return [...currentFiles, ...nextFiles]
    })

    event.target.value = ""
  }

  const removeSelectedFile = (fileName: string, lastModified: number) => {
    setSelectedFiles((currentFiles) =>
      currentFiles.filter(
        (file) =>
          !(file.name === fileName && file.lastModified === lastModified)
      )
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsPending(true)

    try {
      const formData = new FormData(event.currentTarget)
      formData.set("projectId", projectId)
      formData.set("timezone", Intl.DateTimeFormat().resolvedOptions().timeZone)
      formData.set("isMilestone", isMilestone.toString())
      formData.set("requiresApproval", requiresApproval.toString())

      let attachments: TimelineAttachmentPayload[] = []

      if (selectedFiles.length > 0) {
        const uploadResult = await startUpload(selectedFiles, {
          projectId,
          scope: "timeline",
        } as never)

        if (!uploadResult) {
          throw new Error("Upload interrompido")
        }

        attachments = uploadResult.map((file) => ({
          name: file.name,
          url: file.ufsUrl,
          key: file.key,
          customId: file.customId ?? null,
          type: getAttachmentType(file.type),
          mimeType: file.type,
          size: file.size,
        }))
      }

      formData.set("attachments", JSON.stringify(attachments))

      const firstImage = attachments.find(
        (attachment) => attachment.type === AssetType.IMAGE
      )

      if (firstImage) {
        formData.set("imageUrl", firstImage.url)
      }

      const result = await addProjectTimelineAction(formData)

      if (result.success) {
        toast.success("Evolução registrada com sucesso!")
        formRef.current?.reset()
        setIsMilestone(false)
        setRequiresApproval(false)
        setSelectedFiles([])
      } else {
        toast.error(result.error || "Erro ao registrar evolução")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao enviar anexos"
      )
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="flex flex-col gap-8 rounded-3xl border border-border/40 bg-muted/5 p-6 backdrop-blur-sm lg:p-8"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic">
        Os campos marcados com <span className="text-red-500">*</span> são
        obrigatórios.
      </p>

      <FieldGroup className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <Field className="md:col-span-2">
          <FieldLabel className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("title")} <span className="text-red-500">*</span>
          </FieldLabel>
          <InputGroup className="h-14 rounded-2xl border-border/40 bg-muted/10 transition-all focus-within:bg-muted/20">
            <InputGroupInput
              name="title"
              placeholder={t("title_placeholder")}
              required
              className="px-6 font-bold text-foreground"
            />
          </InputGroup>
        </Field>

        <Field className="md:col-span-2">
          <FieldLabel className="mb-4 text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
            {t("description")}
          </FieldLabel>
          <Textarea
            name="description"
            placeholder={t("description_placeholder")}
            className="min-h-[120px] rounded-2xl border-border/40 bg-muted/10 px-6 py-4 font-medium text-foreground transition-all focus:bg-muted/20"
          />
        </Field>

        <Field className="md:col-span-2">
          <div className="flex flex-col gap-4 rounded-3xl border border-border/40 bg-background/30 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <FieldLabel className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
                  {t("attachments")}
                </FieldLabel>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/30">
                  {t("attachments_hint")}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="application/pdf,image/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              <Button
                type="button"
                variant="outline"
                className="rounded-2xl border-border/40 bg-muted/10 px-5 text-[10px] font-black uppercase tracking-[0.2em]"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip weight="bold" className="mr-2 size-4" />
                {t("attachments_button")}
              </Button>
            </div>

            {selectedFiles.length > 0 ? (
              <div className="grid gap-3">
                {selectedFiles.map((file) => (
                  <div
                    key={`${file.name}-${file.lastModified}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border/30 bg-muted/10 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                        <SelectedFileIcon file={file} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-black uppercase tracking-tight text-foreground">
                          {file.name}
                        </p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/40">
                          {file.type || "arquivo"} • {formatBytes(file.size)}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 rounded-xl text-muted-foreground/50 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        removeSelectedFile(file.name, file.lastModified)
                      }
                    >
                      <X weight="bold" className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex min-h-24 items-center justify-center rounded-2xl border border-dashed border-border/30 bg-muted/5 px-4 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/30">
                {t("attachments_empty")}
              </div>
            )}
          </div>
        </Field>

        <Field>
          <label
            htmlFor="isMilestone"
            className="flex items-center justify-between rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 p-6 transition-all hover:border-brand-primary/40 hover:bg-brand-primary/5 cursor-pointer group/milestone"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 select-none group-hover/milestone:text-brand-primary transition-colors">
                <Star
                  weight={isMilestone ? "fill" : "bold"}
                  className={
                    isMilestone
                      ? "text-brand-primary"
                      : "text-muted-foreground/40 group-hover/milestone:text-brand-primary/60"
                  }
                />
                {t("is_milestone")}
              </div>
              <p className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/30 group-hover/milestone:text-brand-primary/40 transition-colors">
                Destaque este evento como um marco importante no projeto
              </p>
            </div>
            <Switch
              id="isMilestone"
              checked={isMilestone}
              onCheckedChange={setIsMilestone}
              className="data-checked:bg-brand-primary shadow-sm"
            />
          </label>
        </Field>

        <Field>
          <label
            htmlFor="requiresApproval"
            className="flex items-center justify-between rounded-2xl border-2 border-dashed border-border/40 bg-muted/5 p-6 transition-all hover:border-brand-primary/40 hover:bg-brand-primary/5 cursor-pointer group/approval"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 select-none group-hover/approval:text-brand-primary transition-colors">
                <CheckCircle
                  weight={requiresApproval ? "fill" : "bold"}
                  className={
                    requiresApproval
                      ? "text-brand-primary"
                      : "text-muted-foreground/40 group-hover/approval:text-brand-primary/60"
                  }
                />
                {t("requires_approval")}
              </div>
              <p className="text-[9px] font-bold uppercase tracking-tight text-muted-foreground/30 group-hover/approval:text-brand-primary/40 transition-colors">
                {t("requires_approval_desc")}
              </p>
            </div>
            <Switch
              id="requiresApproval"
              checked={requiresApproval}
              onCheckedChange={setRequiresApproval}
              className="data-checked:bg-brand-primary shadow-sm"
            />
          </label>
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        disabled={isPending || isUploading}
        className="h-14 w-full rounded-2xl font-sans font-black uppercase tracking-widest transition-all hover:scale-[1.01] active:scale-[0.99] md:w-max md:px-12 shadow-lg shadow-brand-primary/10"
      >
        {isPending || isUploading ? (
          <Spinner className="size-5 animate-spin" />
        ) : (
          <div className="flex items-center gap-3">
            <PlusCircle weight="bold" className="size-5" />
            <span>{t("submit")}</span>
          </div>
        )}
      </Button>
    </form>
  )
}
