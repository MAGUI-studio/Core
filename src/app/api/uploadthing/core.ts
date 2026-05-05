import { auth } from "@clerk/nextjs/server"
import { type FileRouter, createUploadthing } from "uploadthing/next"
import { UTFiles, UploadThingError } from "uploadthing/server"
import { z } from "zod"

import { logger } from "@/src/lib/logger"
import { getCurrentAppUser } from "@/src/lib/project-governance"
import { getUploadProjectAccess } from "@/src/lib/uploadthing-data"

const f = createUploadthing()

function toSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
}

export const ourFileRouter = {
  projectAsset: f({
    pdf: { maxFileSize: "32MB", maxFileCount: 10 },
    image: { maxFileSize: "32MB", maxFileCount: 10 },
    blob: { maxFileSize: "32MB", maxFileCount: 10 },
  })
    .input(
      z
        .object({
          projectId: z.string().min(1).optional(),
          scope: z.enum(["assets", "timeline"]).optional(),
        })
        .optional()
    )
    .middleware(async ({ input, files }) => {
      const { userId } = await auth()

      if (!userId) throw new UploadThingError("Unauthorized")
      const appUser = await getCurrentAppUser()

      if (!input?.projectId) {
        return { userId }
      }

      const project = await getUploadProjectAccess(
        input.projectId,
        appUser?.id ?? ""
      )

      if (!project) {
        throw new UploadThingError("Project not found")
      }

      const canAccess =
        appUser?.role === "ADMIN" ||
        appUser?.role === "MEMBER" ||
        project.client.id === appUser?.id ||
        project.members.length > 0

      if (!canAccess) {
        throw new UploadThingError("Unauthorized")
      }

      const clientLabel =
        project.client.companyName ?? project.client.name ?? project.client.id
      const clientSlug = toSlug(clientLabel)
      const projectSlug = toSlug(project.name)
      const scope = input.scope ?? "assets"

      return {
        userId,
        projectId: project.id,
        [UTFiles]: files.map((file, index) => ({
          ...file,
          customId: `${clientSlug}/${projectSlug}/${scope}/${Date.now()}-${index}-${toSlug(file.name)}`,
        })),
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info(
        {
          userId: metadata.userId,
          projectId: metadata.projectId,
          url: file.url,
          customId: file.customId,
        },
        "Upload complete"
      )

      return { uploadedBy: metadata.userId }
    }),

  maguiConnectAvatar: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const { userId } = await auth()
      if (!userId) throw new UploadThingError("Unauthorized")
      const appUser = await getCurrentAppUser()
      if (!appUser) throw new UploadThingError("Unauthorized")

      return {
        userId,
        appUserId: appUser.id,
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info(
        {
          userId: metadata.userId,
          appUserId: metadata.appUserId,
          url: file.url,
        },
        "Magui Connect Avatar Upload Complete"
      )
      return { uploadedBy: metadata.userId, url: file.url }
    }),

  maguiConnectBanner: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const { userId } = await auth()
      if (!userId) throw new UploadThingError("Unauthorized")
      const appUser = await getCurrentAppUser()
      if (!appUser) throw new UploadThingError("Unauthorized")

      return {
        userId,
        appUserId: appUser.id,
      }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      logger.info(
        {
          userId: metadata.userId,
          appUserId: metadata.appUserId,
          url: file.url,
        },
        "Magui Connect Banner Upload Complete"
      )
      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
