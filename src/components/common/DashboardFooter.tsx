import * as React from "react"

import { Link } from "@/src/i18n/navigation"

import { BackToTopButton } from "@/src/components/common/BackToTopButton"
import { Logo } from "@/src/components/common/logo"

export function DashboardFooter(): React.JSX.Element {
  return (
    <footer className="mt-auto border-t border-border/20 bg-background/35 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-440 flex-col gap-4 px-6 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div className="flex items-center gap-4">
          <Link href="/" className="transition hover:opacity-75">
            <Logo width={124} height={28} priority={false} />
          </Link>
        </div>

        <BackToTopButton />
      </div>
    </footer>
  )
}
