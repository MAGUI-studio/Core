"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import { parseCurrencyBRLToCents } from "@/src/lib/utils/utils"

const ServiceCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  approach: z.string().min(10),
  suggestedValue: z.string().min(1),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isSubscription: z.boolean(),
})

const UpdateServiceCategorySchema = ServiceCategorySchema.extend({
  id: z.string().min(1),
})

function normalizeServiceCategoryForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    approach: String(formData.get("approach") ?? "").trim(),
    suggestedValue: String(formData.get("suggestedValue") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    isSubscription: formData.get("isSubscription") === "on",
  }
}

function toCategoryMutationData(data: z.infer<typeof ServiceCategorySchema>) {
  return {
    name: data.name,
    description: data.description ? data.description : null,
    approach: data.approach,
    suggestedValue: parseCurrencyBRLToCents(data.suggestedValue),
    imageUrl: data.imageUrl ? data.imageUrl : null,
    isSubscription: data.isSubscription,
  }
}

export async function createServiceCategoryAction(formData: FormData) {
  try {
    await protect("admin")

    const parsed = ServiceCategorySchema.safeParse(
      normalizeServiceCategoryForm(formData)
    )

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos")
    }

    await prisma.serviceCategory.create({
      data: toCategoryMutationData(parsed.data),
    })

    revalidatePath("/admin/projects/register")
    revalidatePath("/admin/service-categories")
  } catch (error) {
    logger.error({ error }, "Create Service Category Error")
    return
  }

  redirect("/admin/service-categories")
}

export async function updateServiceCategoryAction(formData: FormData) {
  try {
    await protect("admin")

    const parsed = UpdateServiceCategorySchema.safeParse({
      id: String(formData.get("id") ?? "").trim(),
      ...normalizeServiceCategoryForm(formData),
    })

    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? "Dados invalidos")
    }

    const data = parsed.data

    await prisma.serviceCategory.update({
      where: { id: data.id },
      data: toCategoryMutationData(data),
    })

    revalidatePath("/admin/projects/register")
    revalidatePath("/admin/service-categories")
    revalidatePath(`/admin/service-categories/${data.id}`)
    return
  } catch (error) {
    logger.error({ error }, "Update Service Category Error")
    return
  }
}
