import Image from "next/image"

import { cn } from "@/src/lib/utils/utils"

interface BackgroundImagesProps {
  className?: string
}

const BackgroundImages = ({ className }: BackgroundImagesProps) => {
  return (
    <div
      className={cn(
        "fixed inset-0 -z-10 pointer-events-none select-none w-full max-w-440 mx-auto",
        className
      )}
    >
      <div className="relative w-full h-full dark:hidden">
        <Image
          src="/images/background.png"
          alt="Background Light"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      <div className="relative w-full h-full hidden dark:block">
        <Image
          src="/images/backgroundBlack.png"
          alt="Background Dark"
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 bg-transparent" />
    </div>
  )
}

export default BackgroundImages
