"use client"

import * as React from "react"

import { useTranslations } from "next-intl"
import Link from "next/link"

import { SignIn } from "@clerk/nextjs"
import { ArrowUpRightIcon } from "@phosphor-icons/react"
import { motion } from "framer-motion"

import { LanguageSwitcher } from "@/src/components/common/languageSwitcher"
import { Logo } from "@/src/components/common/logo"
import { ThemeToggle } from "@/src/components/common/themeToggle"

export default function SignInPage(): React.JSX.Element {
  const t = useTranslations("Auth.signIn")

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-440 flex-col overflow-hidden bg-background">
      <div className="absolute top-0 right-0 z-0 select-none opacity-[0.03] dark:opacity-[0.05]">
        <span className="font-heading text-9xl font-black uppercase leading-none tracking-tighter md:text-[12rem] lg:text-[15rem]">
          PORTAL
        </span>
      </div>

      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-50 flex w-full items-center justify-between p-6 md:p-10 lg:px-16 lg:py-12"
      >
        <Link
          href="/"
          className="transition-transform hover:scale-105 active:scale-95"
        >
          <Logo width={180} className="w-35 md:w-45" />
        </Link>
        <div className="flex items-center gap-4 md:gap-10">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </motion.nav>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 md:px-10 lg:px-16">
        <div className="grid w-full grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-0">
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-center lg:col-span-7"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-brand-primary">
                {t("eyebrow")}
              </span>
              <h1 className="font-heading text-5xl font-black uppercase leading-[0.85] tracking-tighter text-foreground sm:text-7xl md:text-8xl lg:text-9xl">
                {t("portal_title")} <br />
                <span className="text-brand-primary">
                  {t("portal_subtitle")}
                </span>
              </h1>
            </div>

            <div className="mt-8 space-y-8 lg:mt-12">
              <div className="h-1.5 w-24 bg-foreground" />
              <p className="max-w-4xl text-sm font-bold uppercase leading-relaxed tracking-[0.2em] text-muted-foreground/80 md:text-base lg:text-lg">
                {t("marketing_description")}
              </p>

              <Link
                href="https://magui.studio"
                target="_blank"
                className="group flex w-fit items-center gap-4 rounded-full bg-foreground px-8 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-background transition-all hover:bg-brand-primary hover:text-white"
              >
                {t("marketing_cta")}
                <ArrowUpRightIcon
                  size={16}
                  weight="bold"
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center lg:col-span-5 lg:items-end"
          >
            <div className="w-full max-w-110">
              <div className="mb-10 space-y-1.5 text-center lg:text-right">
                <h2 className="font-heading text-3xl font-black uppercase tracking-tighter text-foreground lg:text-5xl">
                  {t("ident_title")}
                </h2>
                <div className="mx-auto h-1 w-16 bg-brand-primary lg:mr-0 lg:ml-auto" />
              </div>

              <SignIn
                appearance={{
                  elements: {
                    formButtonPrimary:
                      "rounded-none h-14 bg-brand-primary transition-all font-sans font-black uppercase text-xs tracking-[0.4em] mt-2 text-white! shadow-none",
                    formFieldInput:
                      "h-16 rounded-none border-none bg-muted/20 focus:bg-muted/40 transition-all font-bold text-foreground px-4 text-lg placeholder:text-muted-foreground/30",
                    formFieldLabel:
                      "text-[10px] font-black uppercase tracking-[0.3em] text-foreground mb-2 ml-0",
                  },
                }}
              />
            </div>
          </motion.section>
        </div>
      </div>

      <footer className="relative z-20 flex w-full items-center justify-between p-6 md:p-10 lg:px-16 lg:py-12">
        <span className="text-[10px] font-black uppercase tracking-[0.6em] text-muted-foreground/30">
          © {new Date().getFullYear()} MAGUI.studio
        </span>
      </footer>
    </main>
  )
}
