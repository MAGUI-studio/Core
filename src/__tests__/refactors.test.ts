import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const repoRoot = process.cwd()

function readRepoFile(relativePath: string) {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8")
}

describe("refactor guardrails", () => {
  it("keeps optimistic client flows free of router.refresh", () => {
    const migratedFiles = [
      "src/components/common/Header.tsx",
      "src/components/common/NotificationsDrawer.tsx",
      "src/components/common/BriefingForm.tsx",
      "src/components/admin/AdminTemplateLibrary.tsx",
      "src/components/admin/LeadDetailsDrawer.tsx",
      "src/components/admin/CreateLeadForm.tsx",
      "src/components/admin/ProjectsTable.tsx",
    ]

    for (const file of migratedFiles) {
      expect(readRepoFile(file)).not.toContain("router.refresh(")
    }
  })

  it("keeps client project pages on tab-specific data helpers", () => {
    const clientProjectPages = [
      "src/app/[locale]/(dashboard)/projects/[id]/layout.tsx",
      "src/app/[locale]/(dashboard)/projects/[id]/page.tsx",
      "src/app/[locale]/(dashboard)/projects/[id]/timeline/page.tsx",
      "src/app/[locale]/(dashboard)/projects/[id]/files/page.tsx",
      "src/app/[locale]/(dashboard)/projects/[id]/tasks/page.tsx",
      "src/app/[locale]/(dashboard)/projects/[id]/approvals/page.tsx",
      "src/app/[locale]/(dashboard)/projects/[id]/briefing/page.tsx",
    ]

    for (const file of clientProjectPages) {
      expect(readRepoFile(file)).not.toContain("getClientProjectById(")
    }
  })
})
