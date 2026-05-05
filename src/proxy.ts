import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

import { defaultLocale, locales, pathnames } from "./i18n/config"

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "never",
  pathnames,
})

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/og(.*)",
  "/api/uploadthing(.*)",
  "/api/stripe/webhook(.*)",
])

const isAdminRoute = createRouteMatcher(["/admin(.*)"])
const isApiRoute = createRouteMatcher(["/api(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set("x-pathname", req.nextUrl.pathname)

  if (isApiRoute(req)) {
    if (!isPublicRoute(req)) {
      await auth.protect()
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  if (!isPublicRoute(req)) {
    const { sessionClaims } = await auth.protect()

    if (isAdminRoute(req) && sessionClaims?.metadata?.role !== "admin") {
      const url = new URL("/", req.url)
      return NextResponse.redirect(url)
    }
  }

  const response = intlMiddleware(req)
  response.headers.set("x-pathname", req.nextUrl.pathname)
  return response
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
