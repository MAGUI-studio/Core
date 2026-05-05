"use client"

import * as React from "react"

import { Role, usePermissions } from "@/src/hooks/use-permissions"

interface CanProps {
  role: Role | Role[]

  children: React.ReactNode

  loadingFallback?: React.ReactNode

  fallback?: React.ReactNode
}

export function Can({
  role,
  children,
  loadingFallback = null,
  fallback = null,
}: CanProps): React.JSX.Element | null {
  const { isLoaded, hasRole } = usePermissions()

  if (!isLoaded) {
    return <>{loadingFallback}</>
  }

  if (hasRole(role)) {
    return <>{children}</>
  }

  return <>{fallback}</>
}

export function AdminOnly({
  children,
  loadingFallback,
  fallback,
}: Omit<CanProps, "role">): React.JSX.Element | null {
  return (
    <Can role="admin" loadingFallback={loadingFallback} fallback={fallback}>
      {children}
    </Can>
  )
}
