"use client"

import * as React from "react"

import { AnimatePresence, type Variants, motion } from "framer-motion"
import { createPortal } from "react-dom"

import { cn } from "@/src/lib/utils/utils"

interface PreloaderProps {
  onComplete?: () => void
  siteName?: string
}

export function Preloader({
  onComplete,
  siteName = "MAGUI.studio",
}: PreloaderProps): React.JSX.Element {
  const [mounted, setMounted] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!mounted) {
      return
    }

    const timer = window.setTimeout(() => {
      setIsLoading(false)
      onComplete?.()
    }, 1100)

    return () => window.clearTimeout(timer)
  }, [mounted, onComplete])

  React.useEffect(() => {
    if (!mounted || !isLoading) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [mounted, isLoading])

  const [mainText, studioText] = siteName.split(".")

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: (index = 1) => ({
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
        delayChildren: 0.05 * index,
      },
    }),
  }

  const child: Variants = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300,
      },
    },
    hidden: {
      opacity: 0,
      y: 10,
      transition: {
        type: "spring",
        damping: 15,
        stiffness: 300,
      },
    },
  }

  if (!mounted) {
    return <></>
  }

  return createPortal(
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut", delay: 0.2 },
          }}
          className={cn(
            "fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-transparent transition-colors",
            isLoading ? "pointer-events-auto" : "pointer-events-none"
          )}
        >
          <motion.div
            initial={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{
              duration: 0.9,
              ease: [0.76, 0, 0.24, 1],
              delay: 0.1,
            }}
            className="absolute inset-0 z-20 bg-background"
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute z-30 size-72 rounded-full bg-brand-primary/5 blur-[60px]"
          />

          <motion.div
            className="relative z-40 flex flex-col items-center"
            variants={container}
            initial="hidden"
            animate="visible"
            exit={{
              y: -60,
              opacity: 0,
              filter: "blur(8px)",
              transition: { duration: 0.4, ease: "circIn" },
            }}
          >
            <div className="flex items-baseline overflow-hidden">
              {mainText.split("").map((letter, index) => (
                <motion.span
                  key={`${letter}-${index}`}
                  variants={child}
                  className="font-heading text-5xl font-black uppercase leading-none tracking-[-0.05em] text-foreground/92 md:text-8xl lg:text-9xl"
                >
                  {letter}
                </motion.span>
              ))}
              {studioText && (
                <>
                  <motion.span
                    variants={child}
                    className="font-heading text-5xl font-black leading-none tracking-[-0.05em] text-brand-primary md:text-8xl lg:text-9xl"
                  >
                    .
                  </motion.span>
                  <div className="flex">
                    {studioText.split("").map((letter, index) => (
                      <motion.span
                        key={`${letter}-${index}`}
                        variants={child}
                        className="font-heading text-5xl font-light lowercase leading-none tracking-[-0.05em] text-foreground/92 md:text-8xl lg:text-9xl"
                      >
                        {letter}
                      </motion.span>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
