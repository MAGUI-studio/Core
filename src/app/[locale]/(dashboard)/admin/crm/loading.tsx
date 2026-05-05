import * as React from "react"

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-4xl bg-muted/35 ${className}`}
      aria-hidden="true"
    />
  )
}

export default function CrmLoading(): React.JSX.Element {
  return (
    <main className="grid gap-8 bg-background/50 p-6 lg:p-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="grid gap-3">
          <SkeletonBlock className="h-3 w-32 rounded-full" />
          <SkeletonBlock className="h-16 w-80" />
          <SkeletonBlock className="h-5 w-full max-w-lg" />
        </div>
        <SkeletonBlock className="h-14 w-44 rounded-full" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, column) => (
          <div
            key={column}
            className="grid gap-4 rounded-[1.9rem] border border-border/30 bg-muted/10 p-4"
          >
            <SkeletonBlock className="h-10 rounded-full" />
            {Array.from({ length: 3 }).map((_, card) => (
              <SkeletonBlock key={card} className="h-40" />
            ))}
          </div>
        ))}
      </div>
    </main>
  )
}
