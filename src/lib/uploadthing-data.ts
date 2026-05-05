import { unstable_cache } from "next/cache"

import prisma from "./prisma"

export const getUploadProjectAccessCached = unstable_cache(
  async (projectId: string, appUserId: string) => {
    return prisma.project.findUnique({
      where: { id: projectId },
      select: {
        id: true,
        name: true,
        client: {
          select: {
            id: true,
            name: true,
            companyName: true,
          },
        },
        members: {
          where: {
            userId: appUserId,
          },
          select: {
            id: true,
          },
        },
      },
    })
  },
  ["upload-project-access"],
  { revalidate: 300 } // Short TTL for upload auth
)

export const getUploadProjectAccess = (projectId: string, appUserId: string) =>
  unstable_cache(
    async () => getUploadProjectAccessCached(projectId, appUserId),
    ["upload-project-access", projectId, appUserId],
    { revalidate: 300 }
  )()
