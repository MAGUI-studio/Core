import * as React from "react"

import { Resend } from "resend"

import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"

import { env } from "@/src/config/env"

const resend = new Resend(env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string | string[]
  subject: string
  template: React.ReactElement
  templateKey: string
  userId?: string
  entityType?: string
  entityId?: string
}

export async function sendTransactionalEmail({
  to,
  subject,
  template,
  templateKey,
  userId,
  entityType,
  entityId,
}: SendEmailOptions) {
  if (!env.RESEND_API_KEY) {
    logger.warn(
      { templateKey, to },
      "RESEND_API_KEY not configured, skipping email"
    )
    return { success: false, error: "Email provider not configured" }
  }

  try {
    const data = await resend.emails.send({
      from: "MAGUI.studio <contato@magui.studio>", // Should be a verified domain
      to: Array.isArray(to) ? to : [to],
      subject,
      react: template,
    })

    if (data.error) {
      throw new Error(data.error.message)
    }

    // Log the email
    await prisma.emailLog.create({
      data: {
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        templateKey,
        userId,
        entityType,
        entityId,
        providerMessageId: data.data?.id,
        status: "SENT",
      },
    })

    return { success: true, messageId: data.data?.id }
  } catch (error) {
    logger.error(
      { error, templateKey, to },
      "Error sending transactional email"
    )

    // Log failure
    await prisma.emailLog.create({
      data: {
        to: Array.isArray(to) ? to.join(", ") : to,
        subject,
        templateKey,
        userId,
        entityType,
        entityId,
        status: "FAILED",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      },
    })

    return { success: false, error: "Failed to send email" }
  }
}
