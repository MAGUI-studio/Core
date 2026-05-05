import * as React from "react"

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-4xl bg-muted/35 ${className}`}
      aria-hidden="true"
    />
  )
}

export default function DashboardLoading(): React.JSX.Element {
  return (
    <main className="grid gap-8 bg-background/50 p-6 lg:p-12">
      <div className="grid gap-3">
        <SkeletonBlock className="h-3 w-36 rounded-full" />
        <SkeletonBlock className="h-14 w-full max-w-xl" />
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-32" />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="grid gap-5">
          {Array.from({ length: 3 }).map((_, index) => (
            <SkeletonBlock key={index} className="h-56" />
          ))}
        </div>
        <SkeletonBlock className="h-[32rem]" />
      </div>
    </main>
  )
}
