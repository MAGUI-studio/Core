import { Metadata, Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, getTranslations } from "next-intl/server"

import { enUS, ptBR } from "@clerk/localizations"
import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import "@clerk/ui/themes/shadcn.css"
import { GoogleAnalytics } from "@next/third-parties/google"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { extractRouterConfig } from "uploadthing/server"

import { Toaster } from "@/src/components/ui/sonner"

import { PwaInstallPrompt } from "@/src/components/common/PwaInstallPrompt"
import { ThemeProvider } from "@/src/components/common/themeProvider"

import { cn } from "@/src/lib/utils/utils"

import { env } from "@/src/config/env"
import { fontVariables } from "@/src/config/fonts"
import { siteConfig } from "@/src/config/site"

import { ourFileRouter } from "@/src/app/api/uploadthing/core"
import "@/src/app/globals.css"

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0093C8" },
    { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "Config" })
  const ogUrl = new URL(`${siteConfig.url}/api/og`)
  ogUrl.searchParams.set("title", t("name"))
  ogUrl.searchParams.set("description", t("description"))

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: t("name"),
      template: `%s | ${t("name")}`,
    },
    description: t("description"),
    keywords: t("keywords")
      .split(",")
      .map((k) => k.trim()),
    authors: siteConfig.authors,
    creator: siteConfig.creator,
    alternates: {
      canonical: locale === siteConfig.defaultLocale ? "/" : `/${locale}`,
      languages: {
        pt: "/pt",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      url: locale === siteConfig.defaultLocale ? "/" : `/${locale}`,
      title: t("name"),
      description: t("description"),
      siteName: t("name"),
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: t("name"),
        },
      ],
      locale: locale === "pt" ? "pt_BR" : "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("name"),
      description: t("description"),
      images: [ogUrl.toString()],
      creator: siteConfig.links.twitter
        ? `@${siteConfig.links.twitter.split("/").pop()}`
        : undefined,
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon-16x16.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: t("name"),
    },
    formatDetection: {
      telephone: false,
    },
  }
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>): Promise<React.JSX.Element> {
  const { locale } = await params
  const messages = await getMessages()
  const t = await getTranslations("Config")

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: t("name"),
    description: t("description"),
    url: siteConfig.url,
  }

  const clerkLocalization = locale === "pt" ? ptBR : enUS

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={cn("antialiased", fontVariables)}
      data-scroll-behavior="smooth"
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="mx-auto w-full">
        <ClerkProvider
          localization={clerkLocalization}
          publishableKey={env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
          appearance={{
            theme: shadcn,
            elements: {
              card: "border-0 shadow-none",
              navbar: "border-0 shadow-none",
              pageScrollBox: "gap-4",
              profileSectionPrimaryButton:
                "border-0 shadow-none ring-0 text-xs",
              profileSection__danger: "border-0",
              formButtonPrimary: "border-0 shadow-none text-xs",
              formFieldInput: "border-0 shadow-none ring-0",
              formFieldLabel: "text-xs",
              userButtonBox: "max-w-[180px] gap-2",
              userButtonTrigger:
                "rounded-xl border-0 px-2 py-1.5 shadow-none ring-0",
              userButtonOuterIdentifier:
                "max-w-[120px] truncate text-[11px] leading-tight",
              userButtonInnerIdentifier:
                "max-w-[120px] truncate text-[10px] leading-tight text-muted-foreground",
              userButtonAvatarBox: "size-8",
              userButtonAvatarImage: "border-0 shadow-none ring-0",
              avatarBox: "border-0 shadow-none ring-0",
              avatarImage: "border-0 shadow-none ring-0",
              userPreview: "gap-2",
              userPreviewMainIdentifier:
                "truncate text-sm leading-tight font-medium",
              userPreviewSecondaryIdentifier:
                "truncate text-xs leading-tight text-muted-foreground",
              badge: "border-0 shadow-none text-[10px]",
              accordionTriggerButton: "border-0",
              accordionContent: "border-0",
            },
          }}
          signInUrl={env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
          signUpUrl={env.NEXT_PUBLIC_CLERK_SIGN_IN_URL}
          signInFallbackRedirectUrl={
            env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
          }
          signUpFallbackRedirectUrl={
            env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
          }
        >
          <NextIntlClientProvider messages={messages}>
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            <ThemeProvider>
              <NuqsAdapter>{children}</NuqsAdapter>
              <Toaster />
              <PwaInstallPrompt />
            </ThemeProvider>
          </NextIntlClientProvider>
        </ClerkProvider>

        {siteConfig.analytics.google && (
          <GoogleAnalytics gaId={siteConfig.analytics.google} />
        )}
      </body>
    </html>
  )
}
