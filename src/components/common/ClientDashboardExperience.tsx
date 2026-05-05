"use client"

import * as React from "react"

import { usePathname, useSearchParams } from "next/navigation"

import { motion } from "framer-motion"

import { Preloader } from "@/src/components/common/Preloader"

interface ClientDashboardExperienceProps {
  children: React.ReactNode
  siteName?: string
}

export function ClientDashboardExperience({
  children,
  siteName,
}: ClientDashboardExperienceProps): React.JSX.Element {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isReady, setIsReady] = React.useState(false)

  const experienceKey = React.useMemo(
    () => `${pathname}?${searchParams.toString()}`,
    [pathname, searchParams]
  )

  const handleComplete = React.useCallback(() => {
    setIsReady(true)
  }, [])

  React.useEffect(() => {
    setIsReady(false)
  }, [experienceKey])

  return (
    <React.Fragment key={experienceKey}>
      <Preloader onComplete={handleComplete} siteName={siteName} />

      {isReady ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
        >
          {children}
        </motion.div>
      ) : null}
    </React.Fragment>
  )
}
