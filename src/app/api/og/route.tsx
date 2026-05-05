import { ImageResponse } from "next/og"

import { siteConfig } from "@/src/config/site"

export const runtime = "edge"

export async function GET(req: Request): Promise<ImageResponse> {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get("title") || siteConfig.name
  const description = searchParams.get("description") || siteConfig.shortName

  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#141414",
        backgroundImage:
          "radial-gradient(circle at 2px 2px, #333 1px, transparent 0%)",
        backgroundSize: "48px 48px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "900",
            color: "#0093C8",
            marginBottom: "40px",
            textTransform: "uppercase",
            letterSpacing: "0.5em",
          }}
        >
          {siteConfig.shortName}
        </div>
        <h1
          style={{
            fontSize: "96px",
            fontWeight: "900",
            color: "#F2F2F2",
            marginBottom: "20px",
            lineHeight: 0.8,
            textTransform: "uppercase",
            letterSpacing: "-0.05em",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: "36px",
            color: "#CFCFCF",
            maxWidth: "900px",
            lineHeight: 1.4,
          }}
        >
          {description}
        </p>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "60px",
          display: "flex",
          alignItems: "center",
          color: "#333",
          fontSize: "20px",
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.3em",
        }}
      >
        {siteConfig.url.replace("https://", "")}
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    }
  )
}
