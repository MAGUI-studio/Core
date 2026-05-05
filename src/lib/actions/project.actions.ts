"use server"

import {
  createProjectAssetAction as createProjectAssetActionImpl,
  deleteProjectAssetAction as deleteProjectAssetActionImpl,
  updateProjectAssetAction as updateProjectAssetActionImpl,
  updateProjectAssetsOrderAction as updateProjectAssetsOrderActionImpl,
} from "./project-assets.actions"
import {
  addBriefingNoteAction as addBriefingNoteActionImpl,
  createBriefingNoteAction as createBriefingNoteActionImpl,
  resetProjectBriefingAction as resetProjectBriefingActionImpl,
  savePartialBriefingAction as savePartialBriefingActionImpl,
  updateProjectBriefingAction as updateProjectBriefingActionImpl,
} from "./project-briefing.actions"
import {
  createProjectAction as createProjectActionImpl,
  deleteProjectAction as deleteProjectActionImpl,
  updateProjectStatusAction as updateProjectStatusActionImpl,
} from "./project-lifecycle.actions"
import {
  addProjectMemberAction as addProjectMemberActionImpl,
  removeProjectMemberAction as removeProjectMemberActionImpl,
} from "./project-members.actions"
import {
  addProjectTimelineAction as addProjectTimelineActionImpl,
  approveUpdateAction as approveUpdateActionImpl,
  rejectUpdateAction as rejectUpdateActionImpl,
} from "./project-timeline.actions"

export async function createProjectAction(
  ...args: Parameters<typeof createProjectActionImpl>
): ReturnType<typeof createProjectActionImpl> {
  return createProjectActionImpl(...args)
}

export async function updateProjectStatusAction(
  ...args: Parameters<typeof updateProjectStatusActionImpl>
): ReturnType<typeof updateProjectStatusActionImpl> {
  return updateProjectStatusActionImpl(...args)
}

export async function deleteProjectAction(
  ...args: Parameters<typeof deleteProjectActionImpl>
): ReturnType<typeof deleteProjectActionImpl> {
  return deleteProjectActionImpl(...args)
}

export async function addProjectTimelineAction(
  ...args: Parameters<typeof addProjectTimelineActionImpl>
): ReturnType<typeof addProjectTimelineActionImpl> {
  return addProjectTimelineActionImpl(...args)
}

export async function approveUpdateAction(
  ...args: Parameters<typeof approveUpdateActionImpl>
): ReturnType<typeof approveUpdateActionImpl> {
  return approveUpdateActionImpl(...args)
}

export async function rejectUpdateAction(
  ...args: Parameters<typeof rejectUpdateActionImpl>
): ReturnType<typeof rejectUpdateActionImpl> {
  return rejectUpdateActionImpl(...args)
}

export async function deleteProjectAssetAction(
  ...args: Parameters<typeof deleteProjectAssetActionImpl>
): ReturnType<typeof deleteProjectAssetActionImpl> {
  return deleteProjectAssetActionImpl(...args)
}

export async function updateProjectAssetAction(
  ...args: Parameters<typeof updateProjectAssetActionImpl>
): ReturnType<typeof updateProjectAssetActionImpl> {
  return updateProjectAssetActionImpl(...args)
}

export async function createProjectAssetAction(
  ...args: Parameters<typeof createProjectAssetActionImpl>
): ReturnType<typeof createProjectAssetActionImpl> {
  return createProjectAssetActionImpl(...args)
}

export async function updateProjectAssetsOrderAction(
  ...args: Parameters<typeof updateProjectAssetsOrderActionImpl>
): ReturnType<typeof updateProjectAssetsOrderActionImpl> {
  return updateProjectAssetsOrderActionImpl(...args)
}

export async function updateProjectBriefingAction(
  ...args: Parameters<typeof updateProjectBriefingActionImpl>
): ReturnType<typeof updateProjectBriefingActionImpl> {
  return updateProjectBriefingActionImpl(...args)
}

export async function resetProjectBriefingAction(
  ...args: Parameters<typeof resetProjectBriefingActionImpl>
): ReturnType<typeof resetProjectBriefingActionImpl> {
  return resetProjectBriefingActionImpl(...args)
}

export async function savePartialBriefingAction(
  ...args: Parameters<typeof savePartialBriefingActionImpl>
): ReturnType<typeof savePartialBriefingActionImpl> {
  return savePartialBriefingActionImpl(...args)
}

export async function createBriefingNoteAction(
  ...args: Parameters<typeof createBriefingNoteActionImpl>
): ReturnType<typeof createBriefingNoteActionImpl> {
  return createBriefingNoteActionImpl(...args)
}

export async function addBriefingNoteAction(
  ...args: Parameters<typeof addBriefingNoteActionImpl>
): ReturnType<typeof addBriefingNoteActionImpl> {
  return addBriefingNoteActionImpl(...args)
}

export async function addProjectMemberAction(
  ...args: Parameters<typeof addProjectMemberActionImpl>
): ReturnType<typeof addProjectMemberActionImpl> {
  return addProjectMemberActionImpl(...args)
}

export async function removeProjectMemberAction(
  ...args: Parameters<typeof removeProjectMemberActionImpl>
): ReturnType<typeof removeProjectMemberActionImpl> {
  return removeProjectMemberActionImpl(...args)
}
