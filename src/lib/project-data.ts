import { unstable_cache } from "next/cache"

import { CACHE_TTL } from "@/src/config/cache"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"

export const getProjectForLifecycleCached = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          status: true,
          category: true,
          clientId: true,
        },
      })
    },
    ["project-lifecycle", id],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.adminProject(id)],
    }
  )()

export const getAdminProjectOverview = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
              avatarUrl: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      })
    },
    ["admin-project-overview", id],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.adminProject(id)],
    }
  )()

export const getAdminProjectTimeline = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          updates: {
            orderBy: { createdAt: "desc" },
            include: {
              attachments: true,
              approvalEvents: {
                orderBy: { createdAt: "desc" },
                take: 1,
                include: {
                  actor: {
                    select: {
                      id: true,
                      name: true,
                      role: true,
                    },
                  },
                },
              },
            },
          },
        },
      })
    },
    ["admin-project-timeline", id],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.projectTimeline(id)],
    }
  )()

export const getAdminProjectAudit = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.auditLog.findMany({
        where: { projectId: id },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      })
    },
    ["admin-project-audit", id],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.adminProject(id)],
    }
  )()

export const getAdminProjectAssets = (id: string) =>
  unstable_cache(
    async () => {
      return prisma.project.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          assets: {
            orderBy: { order: "asc" },
          },
        },
      })
    },
    ["admin-project-assets", id],
    {
      revalidate: CACHE_TTL.PROJECT_DETAILS,
      tags: [cacheTags.projectAssets(id), cacheTags.adminProjects],
    }
  )()
