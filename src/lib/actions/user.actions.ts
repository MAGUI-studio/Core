"use server"

import { getTranslations } from "next-intl/server"
import { revalidatePath } from "next/cache"

import { Prisma, UserRole } from "@/src/generated/client"
import { clerkClient, auth } from "@clerk/nextjs/server"
import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { protect } from "@/src/lib/permissions"
import prisma from "@/src/lib/prisma"
import {
  revalidateCrmLeads,
  revalidateMaguiConnectAdminClient,
} from "@/src/lib/revalidate"

const createUserSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  username: z.string().min(3),
  role: z.enum(["admin", "client"]),
  password: z.string().min(8),
  companyName: z.string().optional(),
  phone: z.string().optional(),
  position: z.string().optional(),
  taxId: z.string().optional(),
})

const resetClientPasswordSchema = z.object({
  clerkUserId: z.string().min(1),
  password: z.string().min(8),
})

const updateClientProfileSchema = z.object({
  clerkUserId: z.string().min(1),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().optional(),
  email: z.string().trim().email(),
  username: z.string().trim().min(3),
  companyName: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  position: z.string().trim().optional(),
  taxId: z.string().trim().optional(),
})

export async function createClientAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const t = await getTranslations("Admin.clients.form.errors")

  await protect("admin")

  const validatedFields = createUserSchema.safeParse({
    email: formData.get("email"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    username: formData.get("username"),
    role: formData.get("role"),
    password: formData.get("password"),
    companyName: formData.get("companyName"),
    phone: formData.get("phone"),
    position: formData.get("position"),
    taxId: formData.get("taxId"),
  })

  if (!validatedFields.success) {
    return {
      error: t("general"),
    }
  }

  const {
    email,
    firstName,
    lastName,
    username,
    role,
    password,
    companyName,
    phone,
    position,
    taxId,
  } = validatedFields.data

  try {
    const client = await clerkClient()

    const clerkUser = await client.users.createUser({
      emailAddress: [email],
      username,
      firstName,
      lastName,
      password,
      publicMetadata: { role },
    })

    await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name: `${firstName} ${lastName}`,
        role: role === "admin" ? UserRole.ADMIN : UserRole.CLIENT,
        companyName: companyName ?? null,
        phone: phone ?? null,
        position: position ?? null,
        taxId: taxId ?? null,
      },
    })

    revalidatePath("/admin/clients")
    return { success: true }
  } catch (error) {
    logger.error({ error }, "Clerk Error:")

    const clerkError =
      error instanceof Object && "errors" in error
        ? (error as { errors: Array<{ code: string }> }).errors?.[0]
        : null
    const code = clerkError?.code

    if (code === "form_password_pwned") {
      return { error: t("password_pwned") }
    }
    if (code === "form_identifier_exists") {
      return { error: t("identifier_exists") }
    }
    if (code === "form_password_length_too_short") {
      return { error: t("password_too_short") }
    }
    if (
      code === "form_username_invalid" ||
      code === "form_param_value_invalid"
    ) {
      return { error: t("username_invalid") }
    }

    return {
      error: t("general"),
    }
  }
}

export async function deleteClientAction(
  clerkUserId: string
): Promise<{ error?: string; success?: boolean }> {
  const t = await getTranslations("Admin.clients.form.errors")

  const { userId: currentUserId } = await auth()
  await protect("admin")

  if (clerkUserId === currentUserId) {
    return { error: "Você não pode excluir seu próprio usuário." }
  }

  try {
    const localUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    })

    if (localUser) {
      await prisma.$transaction(async (tx) => {
        const projects = await tx.project.findMany({
          where: { clientId: localUser.id },
          select: { id: true },
        })
        const projectIds = projects.map((project) => project.id)

        const leads = projectIds.length
          ? await tx.lead.findMany({
              where: {
                convertedProjectId: {
                  in: projectIds,
                },
              },
              select: { id: true },
            })
          : []
        const leadIds = leads.map((lead) => lead.id)

        const proposalFilters: Prisma.ProposalWhereInput[] = []
        if (leadIds.length) {
          proposalFilters.push({ leadId: { in: leadIds } })
        }
        if (projectIds.length) {
          proposalFilters.push({ projectId: { in: projectIds } })
        }

        const proposals = proposalFilters.length
          ? await tx.proposal.findMany({
              where: { OR: proposalFilters },
              select: { id: true },
            })
          : []
        const proposalIds = proposals.map((proposal) => proposal.id)

        const documentFilters: Prisma.DocumentWhereInput[] = [
          { clientId: localUser.id },
        ]
        if (projectIds.length) {
          documentFilters.push({ projectId: { in: projectIds } })
        }
        if (leadIds.length) {
          documentFilters.push({ sourceLeadId: { in: leadIds } })
        }

        const documents = await tx.document.findMany({
          where: { OR: documentFilters },
          select: { id: true },
        })
        const documentIds = documents.map((document) => document.id)

        const invoiceFilters: Prisma.InvoiceWhereInput[] = [
          { clientId: localUser.id },
        ]
        if (projectIds.length) {
          invoiceFilters.push({ projectId: { in: projectIds } })
        }
        if (proposalIds.length) {
          invoiceFilters.push({ proposalId: { in: proposalIds } })
        }
        if (documentIds.length) {
          invoiceFilters.push({ documentId: { in: documentIds } })
        }

        const invoices = await tx.invoice.findMany({
          where: { OR: invoiceFilters },
          select: { id: true },
        })
        const invoiceIds = invoices.map((invoice) => invoice.id)

        if (invoiceIds.length) {
          await tx.invoice.deleteMany({
            where: { id: { in: invoiceIds } },
          })
        }

        if (documentIds.length) {
          await tx.document.deleteMany({
            where: { id: { in: documentIds } },
          })
        }

        if (proposalIds.length) {
          await tx.proposal.deleteMany({
            where: { id: { in: proposalIds } },
          })
        }

        if (leadIds.length) {
          await tx.lead.deleteMany({
            where: { id: { in: leadIds } },
          })
        }

        if (projectIds.length) {
          await tx.project.deleteMany({
            where: { id: { in: projectIds } },
          })
        }

        await tx.user.delete({
          where: { clerkId: clerkUserId },
        })
      })
    }

    const client = await clerkClient()
    await client.users.deleteUser(clerkUserId)

    revalidatePath("/admin/clients")
    revalidatePath("/admin/projects")
    revalidatePath("/admin/crm")
    revalidatePath("/admin/crm/proposals")
    revalidatePath("/admin")
    revalidateCrmLeads()
    revalidateMaguiConnectAdminClient(clerkUserId)
    return { success: true }
  } catch (error) {
    logger.error({ error, clerkUserId }, "Delete Client Error:")
    return {
      error: t("general"),
    }
  }
}

export async function resetClientPasswordAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const t = await getTranslations("Admin.clients.form.errors")

  await protect("admin")

  const validatedFields = resetClientPasswordSchema.safeParse({
    clerkUserId: formData.get("clerkUserId"),
    password: formData.get("password"),
  })

  if (!validatedFields.success) {
    return { error: t("general") }
  }

  const { clerkUserId, password } = validatedFields.data

  try {
    const client = await clerkClient()
    await client.users.updateUser(clerkUserId, {
      password,
    })

    revalidatePath("/admin/clients")
    revalidatePath(`/admin/clients/${clerkUserId}`)
    return { success: true }
  } catch (error) {
    logger.error({ error, clerkUserId }, "Reset Client Password Error:")

    const clerkError =
      error instanceof Object && "errors" in error
        ? (error as { errors: Array<{ code: string }> }).errors?.[0]
        : null
    const code = clerkError?.code

    if (code === "form_password_pwned") {
      return { error: t("password_pwned") }
    }
    if (code === "form_password_length_too_short") {
      return { error: t("password_too_short") }
    }

    return { error: t("general") }
  }
}

export async function updateClientProfileAction(
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  const t = await getTranslations("Admin.clients.form.errors")

  await protect("admin")

  const validatedFields = updateClientProfileSchema.safeParse({
    clerkUserId: formData.get("clerkUserId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    username: formData.get("username"),
    companyName: formData.get("companyName"),
    phone: formData.get("phone"),
    position: formData.get("position"),
    taxId: formData.get("taxId"),
  })

  if (!validatedFields.success) {
    return { error: t("general") }
  }

  const {
    clerkUserId,
    firstName,
    lastName,
    email,
    username,
    companyName,
    phone,
    position,
    taxId,
  } = validatedFields.data

  try {
    const client = await clerkClient()
    const clerkUser = await client.users.getUser(clerkUserId)
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.trim()
    const normalizedLastName = lastName?.trim() || undefined

    const currentPrimaryEmail =
      clerkUser.emailAddresses.find(
        (item) => item.id === clerkUser.primaryEmailAddressId
      ) ?? clerkUser.emailAddresses[0]

    if (
      !currentPrimaryEmail ||
      currentPrimaryEmail.emailAddress.toLowerCase() !== normalizedEmail
    ) {
      const existingEmailAddress = clerkUser.emailAddresses.find(
        (item) => item.emailAddress.toLowerCase() === normalizedEmail
      )

      if (existingEmailAddress) {
        await client.emailAddresses.updateEmailAddress(
          existingEmailAddress.id,
          {
            verified: true,
            primary: true,
          }
        )
      } else {
        await client.emailAddresses.createEmailAddress({
          userId: clerkUserId,
          emailAddress: normalizedEmail,
          verified: true,
          primary: true,
        })
      }
    }

    await client.users.updateUser(clerkUserId, {
      firstName: firstName.trim(),
      lastName: normalizedLastName,
      username: normalizedUsername,
    })

    await prisma.user.update({
      where: { clerkId: clerkUserId },
      data: {
        name: [firstName.trim(), normalizedLastName].filter(Boolean).join(" "),
        email: normalizedEmail,
        companyName: companyName?.trim() || null,
        phone: phone?.trim() || null,
        position: position?.trim() || null,
        taxId: taxId?.trim() || null,
      },
    })

    revalidatePath("/admin/clients")
    revalidatePath(`/admin/clients/${clerkUserId}`)
    return { success: true }
  } catch (error) {
    logger.error({ error, clerkUserId }, "Update Client Profile Error:")

    const clerkError =
      error instanceof Object && "errors" in error
        ? (error as { errors: Array<{ code: string }> }).errors?.[0]
        : null
    const code = clerkError?.code

    if (code === "form_identifier_exists") {
      return { error: t("identifier_exists") }
    }
    if (
      code === "form_username_invalid" ||
      code === "form_param_value_invalid"
    ) {
      return { error: t("username_invalid") }
    }

    return { error: t("general") }
  }
}
