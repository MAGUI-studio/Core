import { createNavigation } from "next-intl/navigation"

import { locales, pathnames } from "./config"

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({
    locales,
    pathnames,
  })
