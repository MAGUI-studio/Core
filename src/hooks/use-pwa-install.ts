"use client"

import * as React from "react"

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

function isAppleMobileDevice(userAgent: string, platform: string) {
  const normalizedUa = userAgent.toLowerCase()
  const normalizedPlatform = platform.toLowerCase()

  return (
    /iphone|ipad|ipod/.test(normalizedUa) ||
    (normalizedPlatform === "macintel" && navigator.maxTouchPoints > 1)
  )
}

function isSafariBrowser(userAgent: string) {
  const normalizedUa = userAgent.toLowerCase()

  return (
    normalizedUa.includes("safari") &&
    !normalizedUa.includes("crios") &&
    !normalizedUa.includes("fxios") &&
    !normalizedUa.includes("edgios") &&
    !normalizedUa.includes("chrome") &&
    !normalizedUa.includes("android")
  )
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    React.useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = React.useState(false)
  const [isAppleMobile, setIsAppleMobile] = React.useState(false)
  const [isSafari, setIsSafari] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === "undefined") return

    const userAgent = window.navigator.userAgent
    const platform = window.navigator.platform || ""
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in window.navigator &&
        Boolean(
          (window.navigator as Navigator & { standalone?: boolean }).standalone
        ))

    setIsStandalone(standalone)
    setIsAppleMobile(isAppleMobileDevice(userAgent, platform))
    setIsSafari(isSafariBrowser(userAgent))

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as BeforeInstallPromptEvent)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      )
    }
  }, [])

  const supportsNativePrompt = !isStandalone && deferredPrompt !== null
  const needsManualInstallInstructions = !isStandalone && isAppleMobile
  const requiresSafariForInstall = needsManualInstallInstructions && !isSafari
  const canInstall = !isStandalone && deferredPrompt !== null
  const installStatus = isStandalone
    ? "installed"
    : supportsNativePrompt
      ? "available"
      : needsManualInstallInstructions
        ? "manual"
        : "unavailable"

  const promptInstall = React.useCallback(async () => {
    if (!deferredPrompt) return false

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setIsStandalone(true)
      return true
    }

    return false
  }, [deferredPrompt])

  return {
    canInstall,
    installStatus,
    isStandalone,
    isAppleMobile,
    isSafari,
    needsManualInstallInstructions,
    requiresSafariForInstall,
    supportsNativePrompt,
    promptInstall,
  }
}
