"use client"

import * as React from "react"

import { useTheme } from "next-themes"
import Image from "next/image"

import { cn } from "@/src/lib/utils/utils"

interface LogoProps {
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function Logo({
  width = 160,
  height = 36,
  className,
  priority = true,
}: LogoProps): React.JSX.Element {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Image
        src="/logos/LOGO_VAR_03_DM.svg"
        alt="MAGUI.studio"
        width={width}
        height={height}
        priority={priority}
        className={cn("opacity-20 grayscale", className)}
      />
    )
  }

  const logoSrc =
    resolvedTheme === "dark"
      ? "/logos/LOGO_VAR_03_LM.svg"
      : "/logos/LOGO_VAR_03_DM.svg"

  return (
    <Image
      src={logoSrc}
      alt="MAGUI.studio"
      width={width}
      height={height}
      priority={priority}
      className={className}
    />
  )
}
