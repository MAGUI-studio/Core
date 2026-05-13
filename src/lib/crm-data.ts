import { unstable_cache } from "next/cache"

import { LeadStatus } from "@/src/generated/client"
import { Prisma } from "@/src/generated/client/client"
import { Lead, MessageTemplate, SavedView } from "@/src/types/crm"

import { CACHE_TTL } from "@/src/config/cache"

import { cacheTags } from "./cache-tags"
import prisma from "./prisma"
import {
  getProposalExecutionDaysFromSchedule,
  normalizeProposalScheduleData,
  proposalIncludesMaguiConnectBonus,
} from "./project-schedule"

// Types for DTO mapping
type LeadWithRelations = Prisma.LeadGetPayload<{
  include: {
    activities: {
      include: {
        author: {
          select: { id: true; name: true }
        }
      }
    }
    followUpNotes: {
      include: {
        author: {
          select: { id: true; name: true }
        }
      }
    }
  }
}>

type MessageTemplateType = Prisma.MessageTemplateGetPayload<
  Record<string, never>
>
type SavedViewType = Prisma.SavedViewGetPayload<Record<string, never>>

export const toLeadDto = (lead: LeadWithRelations): Lead => ({
  ...lead,
  proposalCount: 0,
  acceptedProposalCount: 0,
  activities: (lead.activities || []).map((a) => ({
    ...a,
    metadata: (a.metadata as Record<string, unknown>) || {},
  })),
  followUpNotes: (lead.followUpNotes || []).map((n) => ({
    ...n,
  })),
})

export const toMessageTemplateDto = (
  template: MessageTemplateType
): MessageTemplate => ({
  ...template,
})

export const toSavedViewDto = (view: SavedViewType): SavedView => ({
  ...view,
  filtersJson: (view.filtersJson as Record<string, unknown>) || {},
})

/**
 * Fetch leads with caching.
 * The parameters MUST be part of the cache key for stable invalidation and unique entries.
 */
const getLeadsCached = unstable_cache(
  async (page: number, limit: number) => {
    const skip = (page - 1) * limit
    const [leads, totalCount] = await Promise.all([
      prisma.lead.findMany({
        where: {
          status: {
            not: LeadStatus.DESCARTADO,
          },
        },
        include: {
          _count: {
            select: { followUpNotes: true },
          },
          proposals: {
            select: {
              id: true,
              title: true,
              status: true,
              totalValue: true,
              scheduleData: true,
            },
          },
        },
        orderBy: [{ nextActionAt: "asc" }, { createdAt: "desc" }],
        skip,
        take: limit,
      }),
      prisma.lead.count({
        where: {
          status: {
            not: LeadStatus.DESCARTADO,
          },
        },
      }),
    ])
    return { leads, totalCount, totalPages: Math.ceil(totalCount / limit) }
  },
  ["admin-crm-leads-list"],
  {
    revalidate: CACHE_TTL.LEADS,
    tags: [cacheTags.adminCrmLeads, cacheTags.adminCrm],
  }
)

export const getLeads = async (page: number = 1, limit: number = 100) => {
  const { leads } = await getLeadsCached(page, limit)

  // Important: Explicitly map the leads to ensure all fields like 'status' are preserved
  // and the notes placeholder count is correct for the UI.
  return leads.map((l) => ({
    ...l,
    proposalCount: l.proposals.length,
    acceptedProposalCount: l.proposals.filter((p) => p.status === "ACCEPTED")
      .length,
    acceptedProposals: l.proposals
      .filter((p) => p.status === "ACCEPTED")
      .map((proposal) => ({
        id: proposal.id,
        title: proposal.title,
        totalValue: proposal.totalValue,
        projectCategory: normalizeProposalScheduleData(proposal.scheduleData)
          .projectCategory,
        executionBusinessDays: getProposalExecutionDaysFromSchedule(
          proposal.scheduleData
        ),
        includesMaguiConnectBonus: proposalIncludesMaguiConnectBonus(
          proposal.scheduleData
        ),
      })),
    activities: [],
    followUpNotes: Array(l._count.followUpNotes).fill({}),
  })) as unknown as Lead[]
}

export const getLeadDetails = async (id: string) => {
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      activities: {
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { id: true, name: true },
          },
        },
      },
      followUpNotes: {
        orderBy: {
          createdAt: "desc",
        },
        include: {
          author: {
            select: { id: true, name: true },
          },
        },
      },
    },
  })
  return lead ? toLeadDto(lead as LeadWithRelations) : null
}

const getMessageTemplatesRawCached = unstable_cache(
  async (scope: string) => {
    return prisma.messageTemplate.findMany({
      where: { scope },
      orderBy: { createdAt: "asc" },
    })
  },
  ["admin:crm:templates:list"],
  {
    revalidate: CACHE_TTL.USER_PREFERENCES,
    tags: [cacheTags.adminCrmTemplates, cacheTags.adminCrm],
  }
)

export const getMessageTemplates = async (scope: string = "LEAD") => {
  const templates = await getMessageTemplatesRawCached(scope)
  return (templates as MessageTemplateType[]).map(toMessageTemplateDto)
}

const getSavedCrmViewsRawCached = unstable_cache(
  async (userId: string) => {
    return prisma.savedView.findMany({
      where: {
        userId,
        module: "CRM",
      },
      orderBy: { updatedAt: "desc" },
    })
  },
  ["admin:crm:views:list"],
  {
    revalidate: CACHE_TTL.LEADS,
    tags: [cacheTags.adminCrm],
  }
)

export const getSavedCrmViews = async (userId: string) => {
  const views = await getSavedCrmViewsRawCached(userId)
  return (views as SavedViewType[]).map(toSavedViewDto)
}

const getCrmPreferencesRawCached = unstable_cache(
  async (userId: string) => {
    return prisma.savedView.findFirst({
      where: {
        userId,
        module: "CRM_PREFERENCES",
        name: "default",
      },
    })
  },
  ["admin:crm:preferences:default"],
  {
    revalidate: CACHE_TTL.LEADS,
    tags: [cacheTags.adminCrm],
  }
)

export const getCrmPreferences = async (userId: string) => {
  const prefs = await getCrmPreferencesRawCached(userId)
  return prefs ? toSavedViewDto(prefs as SavedViewType) : null
}

export const getLeadProposals = unstable_cache(
  async (leadId: string) => {
    return prisma.proposal.findMany({
      where: { leadId },
      include: { items: { orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    })
  },
  ["admin:crm:lead:proposals"],
  {
    revalidate: CACHE_TTL.LEADS,
    tags: [cacheTags.adminCrm],
  }
)
