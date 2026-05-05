import * as React from "react"

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-4xl bg-muted/35 ${className}`}
      aria-hidden="true"
    />
  )
}

export default function ProjectDetailLoading(): React.JSX.Element {
  return (
    <main className="grid gap-10 bg-background/50 p-6 lg:p-12">
      <div className="grid gap-4">
        <SkeletonBlock className="h-8 w-28 rounded-full" />
        <SkeletonBlock className="h-20 w-full max-w-3xl" />
        <div className="flex gap-4">
          <SkeletonBlock className="h-12 w-44" />
          <SkeletonBlock className="h-12 w-44" />
        </div>
      </div>

      <SkeletonBlock className="h-12 w-full" />

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="grid gap-5">
          <SkeletonBlock className="h-72" />
          <SkeletonBlock className="h-52" />
        </div>
        <SkeletonBlock className="h-96" />
      </div>
    </main>
  )
}
