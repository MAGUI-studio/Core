import createNextIntlPlugin from "next-intl/plugin"
import withBundleAnalyzer from "@next/bundle-analyzer"
import withSerwistInit from "@serwist/next"

const withNextIntl = createNextIntlPlugin()

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
})

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.utfs.io",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "ufs.sh",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
}

export default analyzer(withNextIntl(withSerwist(nextConfig)))
