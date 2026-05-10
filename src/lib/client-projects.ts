import { ApprovalStatus } from "@/src/generated/client"

import prisma from "./prisma"

export async function getClientHomeData(userId: string) {
  const projects = await prisma.project.findMany({
    where: { clientId: userId },
    include: {
      updates: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { attachments: true },
      },
      invoices: {
        where: { status: { not: "CANCELLED" } },
        include: {
          installments: {
            orderBy: { dueDate: "asc" },
          },
        },
      },
      _count: {
        select: {
          updates: {
            where: {
              requiresApproval: true,
              approvalStatus: ApprovalStatus.PENDING,
            },
          },
          actionItems: {
            where: { status: "PENDING" },
          },
          invoices: {
            where: { status: { not: "PAID" } },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })

  return { projects }
}

export async function getClientHomePending(userId: string) {
  const projects = await prisma.project.findMany({
    where: { clientId: userId },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          updates: {
            where: {
              requiresApproval: true,
              approvalStatus: ApprovalStatus.PENDING,
            },
          },
          actionItems: {
            where: {
              status: "PENDING",
              targetRole: "CLIENT",
            },
          },
        },
      },
    },
  })

  return projects.filter(
    (p) => p._count.updates > 0 || p._count.actionItems > 0
  )
}

export async function getClientHomeActivity(userId: string) {
  return prisma.auditLog.findMany({
    where: {
      project: { clientId: userId },
    },
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  })
}

export async function getClientPendingItems(projectIds: string[]) {
  return prisma.project.findMany({
    where: { id: { in: projectIds } },
    select: {
      id: true,
      _count: {
        select: {
          updates: {
            where: {
              requiresApproval: true,
              approvalStatus: ApprovalStatus.PENDING,
            },
          },
          actionItems: {
            where: { status: "PENDING", targetRole: "CLIENT" },
          },
        },
      },
    },
  })
}

export async function getClientProjects(userId: string) {
  return prisma.project.findMany({
    where: { clientId: userId },
    select: {
      id: true,
      name: true,
      status: true,
      progress: true,
      updatedAt: true,
      scheduleData: true,
      client: {
        select: {
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  })
}

export async function getClientProjectById(id: string, userId: string) {
  return prisma.project.findUnique({
    where: { id, clientId: userId },
    include: {
      client: true,
      updates: {
        orderBy: { createdAt: "desc" },
        include: { attachments: true },
      },
      assets: {
        orderBy: { order: "asc" },
      },
      actionItems: {
        orderBy: { dueDate: "asc" },
      },
      briefingNotes: {
        orderBy: { createdAt: "desc" },
      },
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
      },
    },
  })
}

export async function getClientProjectBreadcrumb(id: string, userId: string) {
  return prisma.project.findUnique({
    where: { id, clientId: userId },
    select: {
      id: true,
      name: true,
      invoices: {
        where: { status: { not: "CANCELLED" } },
        select: {
          status: true,
          installments: {
            select: { status: true },
          },
        },
      },
    },
  })
}

export async function getClientProjectOverview(id: string, userId: string) {
  return prisma.project.findUnique({
    where: { id, clientId: userId },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      progress: true,
      scheduleData: true,
      updates: {
        where: {
          requiresApproval: true,
          approvalStatus: ApprovalStatus.PENDING,
        },
        select: {
          id: true,
          title: true,
          requiresApproval: true,
          approvalStatus: true,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      actionItems: {
        where: { targetRole: "CLIENT", status: "PENDING" },
        select: {
          id: true,
          title: true,
          targetRole: true,
        },
        orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
        take: 1,
      },
      _count: {
        select: {
          assets: true,
          updates: true,
          actionItems: {
            where: { targetRole: "CLIENT", status: "PENDING" },
          },
          invoices: {
            where: { status: { not: "PAID" } },
          },
        },
      },
    },
  })
}

export async function getClientProjectTimeline(
  id: string,
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit
  const [project, totalCount] = await Promise.all([
    prisma.project.findUnique({
      where: { id, clientId: userId },
      select: {
        id: true,
        name: true,
        updates: {
          orderBy: { createdAt: "desc" },
          include: { attachments: true },
          skip,
          take: limit,
        },
      },
    }),
    prisma.update.count({ where: { projectId: id } }),
  ])
  return project
    ? { ...project, totalCount, totalPages: Math.ceil(totalCount / limit) }
    : null
}

export async function getClientProjectFiles(
  id: string,
  userId: string,
  page: number = 1,
  limit: number = 30
) {
  const skip = (page - 1) * limit
  const [project, totalCount] = await Promise.all([
    prisma.project.findUnique({
      where: { id, clientId: userId },
      select: {
        id: true,
        name: true,
        assets: {
          orderBy: { order: "asc" },
          skip,
          take: limit,
        },
      },
    }),
    prisma.asset.count({ where: { projectId: id } }),
  ])
  return project
    ? { ...project, totalCount, totalPages: Math.ceil(totalCount / limit) }
    : null
}

export async function getClientProjectTasks(
  id: string,
  userId: string,
  page: number = 1,
  limit: number = 50
) {
  const skip = (page - 1) * limit
  const [project, totalCount] = await Promise.all([
    prisma.project.findUnique({
      where: { id, clientId: userId },
      select: {
        id: true,
        name: true,
        actionItems: {
          where: { targetRole: "CLIENT", status: "PENDING" },
          orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
          skip,
          take: limit,
        },
      },
    }),
    prisma.actionItem.count({
      where: { projectId: id, targetRole: "CLIENT", status: "PENDING" },
    }),
  ])
  return project
    ? { ...project, totalCount, totalPages: Math.ceil(totalCount / limit) }
    : null
}

export async function getClientProjectApprovals(id: string, userId: string) {
  return prisma.project.findUnique({
    where: { id, clientId: userId },
    select: {
      id: true,
      name: true,
      updates: {
        where: { requiresApproval: true },
        orderBy: { createdAt: "desc" },
        include: { attachments: true },
      },
      _count: {
        select: {
          updates: {
            where: { requiresApproval: true },
          },
        },
      },
    },
  })
}

export async function getClientProjectBriefing(id: string, userId: string) {
  return prisma.project.findUnique({
    where: { id, clientId: userId },
    select: {
      id: true,
      name: true,
      briefing: true,
      briefingNotes: {
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          briefingNotes: true,
        },
      },
    },
  })
}

export async function getClientNotifications(
  userId: string,
  page: number = 1,
  limit: number = 50
) {
  const skip = (page - 1) * limit
  const [notifications, totalCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ])
  return {
    notifications,
    totalCount,
    totalPages: Math.ceil(totalCount / limit),
  }
}
