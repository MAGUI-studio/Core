import * as React from "react"

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components"

interface BaseEmailLayoutProps {
  preview: string
  title: string
  children: React.ReactNode
  ctaText?: string
  ctaUrl?: string
}

export const BaseEmailLayout = ({
  preview,
  title,
  children,
  ctaText,
  ctaUrl,
}: BaseEmailLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto my-10 max-w-[600px] rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
            <Section className="mb-8">
              <Img
                src="https://magui.studio/logos/logo-main.png"
                width="120"
                height="40"
                alt="MAGUI.studio"
                className="mx-auto"
              />
            </Section>

            <Heading className="mb-6 text-center text-2xl font-black uppercase tracking-tight text-slate-900">
              {title}
            </Heading>

            <Section className="mb-8 text-slate-700 leading-relaxed">
              {children}
            </Section>

            {ctaText && ctaUrl && (
              <Section className="mb-8 text-center">
                <Link
                  href={ctaUrl}
                  className="inline-block rounded-full bg-blue-600 px-8 py-4 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-blue-600/20 no-underline"
                >
                  {ctaText}
                </Link>
              </Section>
            )}

            <Hr className="my-8 border-slate-200" />

            <Section className="text-center">
              <Text className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Padrão de Autoridade Digital
              </Text>
              <Text className="text-[10px] text-slate-400">
                MAGUI.studio • Estratégia, Design e Engenharia de Elite
              </Text>
              <Text className="mt-2 text-[10px] text-slate-400">
                © 2026 MAGUI.studio. Todos os direitos reservados.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
