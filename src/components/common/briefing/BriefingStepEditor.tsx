"use client"

import * as React from "react"

import { useTranslations } from "next-intl"

import { PlusIcon, TrashIcon } from "@phosphor-icons/react"
import { HexColorPicker } from "react-colorful"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover"

import { markActionItemAsCompletedAction } from "@/src/lib/actions/project-briefing.actions"

import { StepId } from "@/src/hooks/use-briefing-form"

import { LogoUploadEditor } from "./LogoUploadEditor"

interface BriefingStepEditorProps {
  projectId: string
  currentStepId: StepId
  formData: Record<string, unknown>
  setFormData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>
}

interface PaletteData {
  primary: string
  secondary: string
  accent?: string
}

export function BriefingStepEditor({
  projectId,
  currentStepId,
  formData,
  setFormData,
}: BriefingStepEditorProps) {
  const t = useTranslations("Briefing")
  const value = formData[currentStepId]
  const onValueChange = (v: unknown) => {
    setFormData((f) => ({ ...f, [currentStepId]: v }))
  }

  const renderListInput = (list: string[]) => (
    <div className="space-y-6">
      {list.map((item, i) => (
        <div key={i} className="group relative flex items-center">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const n = [...list]
              n[i] = e.target.value
              onValueChange(n)
            }}
            placeholder={t(`steps.${currentStepId}.placeholder`)}
            className="w-full bg-transparent border-b border-border/30 pr-12 py-6 text-xl text-foreground font-medium focus:border-brand-primary outline-none"
          />
          {list.length > 1 && (
            <button
              onClick={() => {
                const n = [...list]
                n.splice(i, 1)
                onValueChange(n.length ? n : [""])
              }}
              className="absolute right-0 size-10 text-muted-foreground/20 hover:text-destructive"
            >
              <TrashIcon size={20} weight="fill" />
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => onValueChange([...list, ""])}
        className="group mt-8 flex items-center gap-3 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand-primary hover:opacity-70"
      >
        <div className="flex size-8 items-center justify-center rounded-full bg-brand-primary/10">
          <PlusIcon size={14} weight="bold" />
        </div>
        {t("add_item")}
      </button>
    </div>
  )

  if (currentStepId === "palette") {
    const p = (formData.palette as PaletteData) || {
      primary: "#000000",
      secondary: "#FFFFFF",
      accent: "",
    }

    const handleColorChange = async (key: keyof PaletteData, color: string) => {
      setFormData((prev: Record<string, unknown>) => ({
        ...prev,
        palette: { ...(prev.palette as PaletteData), [key]: color },
      }))
      if (key === "primary" && color.startsWith("#")) {
        await markActionItemAsCompletedAction(
          projectId,
          "Definir cores principais da marca (HEX)"
        )
      }
    }

    return (
      <div className="space-y-12 pt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60">
              Cor Principal (HEX)
            </label>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="size-16 rounded-2xl cursor-pointer bg-transparent border-2 border-border/20 transition-transform hover:scale-95"
                    style={{ backgroundColor: p.primary }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-2xl">
                  <HexColorPicker
                    color={p.primary}
                    onChange={(color) => handleColorChange("primary", color)}
                  />
                </PopoverContent>
              </Popover>
              <input
                type="text"
                value={p.primary}
                onChange={(e) => handleColorChange("primary", e.target.value)}
                className="bg-transparent border-b border-border/40 text-2xl font-bold uppercase outline-none focus:border-brand-primary font-mono"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-[0.24em] text-muted-foreground/60">
              Cor Secundária (HEX)
            </label>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="size-16 rounded-2xl cursor-pointer bg-transparent border-2 border-border/20 transition-transform hover:scale-95"
                    style={{ backgroundColor: p.secondary }}
                  />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-none shadow-2xl">
                  <HexColorPicker
                    color={p.secondary}
                    onChange={(color) => handleColorChange("secondary", color)}
                  />
                </PopoverContent>
              </Popover>
              <input
                type="text"
                value={p.secondary}
                onChange={(e) => handleColorChange("secondary", e.target.value)}
                className="bg-transparent border-b border-border/40 text-2xl font-bold uppercase outline-none focus:border-brand-primary font-mono"
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentStepId === "logos") {
    return (
      <LogoUploadEditor
        projectId={projectId}
        value={
          formData.logos as {
            primary: { name: string; url: string; key: string } | null
            secondary: { name: string; url: string; key: string } | null
          }
        }
        onValueChange={(key, asset) =>
          setFormData((prev: Record<string, unknown>) => ({
            ...prev,
            logos: {
              ...(prev.logos as Record<string, unknown>),
              [key]: asset,
            },
          }))
        }
      />
    )
  }

  if (
    ["visualReferences", "dislikedReferences", "competitors"].includes(
      currentStepId
    )
  ) {
    return renderListInput((value as string[]) || [""])
  }

  return (
    <textarea
      value={value as string}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full min-h-30 lg:min-h-60 resize-none bg-transparent text-2xl font-medium leading-relaxed text-foreground placeholder:text-muted-foreground/20 focus:outline-none xl:text-3xl"
      placeholder={t("answer_label")}
      autoFocus
    />
  )
}
