import { getTranslations } from "next-intl/server"

import { MaguiConnectEditor } from "@/src/components/client/maguiConnect/MaguiConnectEditor"
import { MaguiConnectLinkList } from "@/src/components/client/maguiConnect/MaguiConnectLinkList"
import { MaguiConnectLockedState } from "@/src/components/client/maguiConnect/MaguiConnectLockedState"
import { MaguiConnectSectionList } from "@/src/components/client/maguiConnect/MaguiConnectSectionList"

import { getOwnMaguiConnectProfile } from "@/src/lib/maguiConnectData"
import { getCurrentAppUser } from "@/src/lib/project-governance"

export async function generateMetadata() {
  const t = await getTranslations("MaguiConnect")
  return {
    title: `${t("pageTitle")} | ${t("navLinks")}`,
  }
}

export default async function MaguiConnectLinksPage() {
  const user = await getCurrentAppUser()
  if (!user) return null

  if (!user.canAccessMaguiConnect) {
    return <MaguiConnectLockedState />
  }

  const t = await getTranslations("MaguiConnect")
  const profile = await getOwnMaguiConnectProfile(user.id)
  const links = profile?.links ?? []
  const sections = profile?.sections ?? []

  return (
    <div className="min-h-full px-6 py-12 lg:px-12 lg:py-16 space-y-12 bg-background">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tighter lg:text-5xl">
          {t("navLinks")}
        </h1>
        <p className="text-muted-foreground">{t("linksDescription")}</p>
      </div>

      <div className="grid gap-16 xl:grid-cols-[1.2fr_1fr] xl:gap-24">
        {/* Profile Editor Column */}
        <section className="space-y-10 w-full max-w-4xl">
          <div className="space-y-2">
            <h2 className="text-2xl font-black tracking-tighter">
              {t("registerTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("registerDescription")}
            </p>
          </div>
          <MaguiConnectEditor initialProfile={profile} />
        </section>

        {/* Links List Column */}
        <section className="space-y-10 w-full">
          <MaguiConnectLinkList links={links} sections={sections} />
          <MaguiConnectSectionList sections={sections} />
        </section>
      </div>
    </div>
  )
}
