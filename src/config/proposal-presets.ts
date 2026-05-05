export interface ProposalPreset {
  id: string
  label: string
  content: string
}

export interface ProposalPresets {
  executiveSummary: ProposalPreset[]
  objectives: ProposalPreset[]
  expectedImpact: ProposalPreset[]
  differentials: ProposalPreset[]
  timeline: ProposalPreset[]
  paymentTerms: ProposalPreset[]
  platformFlow: ProposalPreset[]
  nextSteps: ProposalPreset[]
  acceptanceCriteria: ProposalPreset[]
  notIncluded: ProposalPreset[]
  warranty: ProposalPreset[]
  itemDescriptions: ProposalPreset[]
  itemLongDescriptions: ProposalPreset[]
}

export const PROPOSAL_PRESETS: ProposalPresets = {
  executiveSummary: [
    {
      id: "exec-performance",
      label: "Performance e Conversão",
      content:
        "A MAGUI.studio propõe uma entrega premium focada em performance e conversão para a [Empresa]. O objetivo é estruturar uma experiência digital que não apenas apresente a marca, mas conduza o usuário para a próxima ação com clareza, velocidade e uma narrativa comercial consistente, eliminando ruídos que impedem a decisão.",
    },
    {
      id: "exec-institucional",
      label: "Institucional e Autoridade",
      content:
        "Esta proposta foca em elevar o posicionamento e a percepção de autoridade da [Empresa]. Estruturamos uma presença digital que comunica clareza, confiança e rigor técnico, garantindo que a primeira impressão do cliente seja de total profissionalismo e alinhamento com o valor da marca.",
    },
    {
      id: "exec-estabilidade",
      label: "Operação e Estabilidade",
      content:
        "Esta proposta foca em previsibilidade operacional para a [Empresa]: performance contínua, ajustes evolutivos e redução de débitos técnicos. A intenção é manter a presença digital estável, rápida e sempre pronta para a operação comercial, permitindo que o time foque no negócio enquanto cuidamos da tecnologia.",
    },
  ],
  objectives: [
    {
      id: "obj-lp",
      label: "Landing Page (Conversão)",
      content:
        "Otimizar o fluxo de conversão e velocidade de resposta, reduzindo o custo de aquisição e aumentando a taxa de contato direto com uma página focada em um único objetivo comercial claro.",
    },
    {
      id: "obj-inst",
      label: "Institucional (Posicionamento)",
      content:
        "Garantir clareza de posicionamento e facilidade de navegação, permitindo que o cliente encontre o que precisa rapidamente e entenda a proposta de valor da [Empresa] sem ruídos.",
    },
    {
      id: "obj-booking",
      label: "Booking (Fluxo de Agendamento)",
      content:
        "Reduzir a fricção no agendamento e automatizar etapas de confirmação, garantindo que o fluxo de agendamento seja intuitivo e resulte em uma taxa maior de comparecimento.",
    },
    {
      id: "obj-stability",
      label: "Estabilidade (Continuidade)",
      content:
        "Manter performance de elite, segurança atualizada e evolução constante, garantindo que a plataforma cresça junto com as demandas do negócio de forma previsível.",
    },
  ],
  expectedImpact: [
    {
      id: "imp-clarity",
      label: "Clareza e Confiança",
      content:
        "Aumento imediato na percepção de valor por parte do cliente final, resultando em menos tempo gasto explicando o básico e mais tempo fechando negócios de alto valor.",
    },
    {
      id: "imp-speed",
      label: "Velocidade de Decisão",
      content:
        "Redução no ciclo de vendas: uma experiência fluida e sem erros técnicos transmite segurança, acelerando a decisão do cliente que sente que está em boas mãos.",
    },
    {
      id: "imp-abandonment",
      label: "Redução de Abandono",
      content:
        "Melhoria direta nas métricas de retenção e conversão (Core Web Vitals), garantindo que o usuário não abandone o site por lentidão ou falta de clareza visual.",
    },
  ],
  differentials: [
    {
      id: "diff-governance",
      label: "Governança e Cadência",
      content:
        "Processo com checkpoints claros e critérios de aceite objetivos. Você sabe exatamente o que está sendo feito, quando será entregue e como validar cada etapa.",
    },
    {
      id: "diff-documentation",
      label: "Documentação e Rigor",
      content:
        "Entrega com rigor técnico: código limpo, documentado e preparado para escala. Não entregamos apenas uma 'página', entregamos um ativo digital durável.",
    },
    {
      id: "diff-seo",
      label: "Performance e SEO",
      content:
        "Foco obsessivo em performance e estrutura semântica. O projeto nasce otimizado para motores de busca e com tempos de carregamento que superam a média do mercado.",
    },
  ],
  timeline: [
    {
      id: "time-standard",
      label: "Padrão 20 dias úteis",
      content:
        "Estimativa de 20 dias úteis para conclusão total, dependendo do envio ágil de materiais e feedbacks nos checkpoints. O cronograma é monitorado em tempo real pela plataforma.",
    },
    {
      id: "time-complex",
      label: "Padrão 30-45 dias úteis",
      content:
        "Ciclo de 30 a 45 dias úteis para projetos de maior complexidade, estruturado em sprints de design, desenvolvimento e QA final para garantir zero erros no lançamento.",
    },
  ],
  paymentTerms: [
    {
      id: "pay-kickoff",
      label: "Entrada + Entrega",
      content:
        "50% na aprovação (reserva de agenda e início da estrutura) e 50% após a aprovação final e entrada em produção. Pagamento via PIX ou transferência bancária.",
    },
    {
      id: "pay-milestones",
      label: "Marcos de Produção",
      content:
        "40% na aprovação, 30% na aprovação do design/UX e 30% na entrega final. Este modelo vincula o investimento ao progresso real e visível das etapas do projeto.",
    },
    {
      id: "pay-recurring",
      label: "Recorrência Mensal",
      content:
        "Investimento mensal fixo com vencimento no início de cada ciclo de 30 dias. Garante prioridade de agenda para melhorias e monitoramento ativo da plataforma.",
    },
  ],
  platformFlow: [
    {
      id: "plat-default",
      label: "Centralização e Histórico",
      content:
        "Toda a comunicação, aprovações e entrega de arquivos acontecem exclusivamente pela plataforma MAGUI. Isso garante que nenhuma decisão se perca em e-mails ou WhatsApp, criando um histórico seguro e auditável para ambos os lados.",
    },
  ],
  nextSteps: [
    {
      id: "next-standard",
      label: "Checklist de Início",
      content:
        "1. Aprovação desta proposta comercial;\n2. Assinatura do contrato digital;\n3. Confirmação do pagamento inicial;\n4. Preenchimento do briefing detalhado para início imediato.",
    },
  ],
  acceptanceCriteria: [
    {
      id: "acc-perf",
      label: "Performance e SEO",
      content:
        "- Notas de performance acima de 90 no Lighthouse (mobile/desktop);\n- SEO base configurado (meta tags, semântica, sitemap);\n- Responsividade validada em navegadores modernos.",
    },
    {
      id: "acc-visual",
      label: "Fidelidade Visual",
      content:
        "- Interface fiel ao design aprovado no checkpoint de UX;\n- Interações e animações fluidas e sem erros de layout;\n- Links e formulários testados e integrados.",
    },
  ],
  notIncluded: [
    {
      id: "not-content",
      label: "Criação de Conteúdo",
      content:
        "- Produção de fotos ou vídeos profissionais;\n- Redação de textos (copywriting) além do estrutural acordado;\n- Compra de fontes ou bancos de imagens premium pagos.",
    },
    {
      id: "not-ads",
      label: "Tráfego e Gestão",
      content:
        "- Configuração ou gestão de campanhas de tráfego pago (Google/Meta Ads);\n- Custos de hospedagem, domínio ou APIs de terceiros após o lançamento.",
    },
  ],
  warranty: [
    {
      id: "war-30days",
      label: "30 Dias de Ajustes",
      content:
        "Garantia de 30 dias após o lançamento para correções de bugs técnicos ou ajustes finos de layout que não descaracterizem o escopo original aprovado.",
    },
  ],
  itemDescriptions: [
    {
      id: "item-desc-lp",
      label: "Landing Page",
      content: "Landing page comercial (copy + UX + performance)",
    },
    {
      id: "item-desc-inst",
      label: "Institucional",
      content: "Website institucional (estrutura + páginas + SEO base)",
    },
    {
      id: "item-desc-booking",
      label: "Booking",
      content: "Plataforma de agendamento (fluxo + integrações)",
    },
    {
      id: "item-desc-stability",
      label: "Estabilidade",
      content: "Plano de estabilidade (monitoramento + melhorias)",
    },
  ],
  itemLongDescriptions: [
    {
      id: "item-long-lp",
      label: "Landing Page Detalhada",
      content:
        "Foco em conversão direta. Inclui arquitetura de persuasão, design responsivo de alta performance, integração com formulários/WhatsApp e otimização para carregamento instantâneo em dispositivos móveis.",
    },
    {
      id: "item-long-inst",
      label: "Institucional Detalhado",
      content:
        "Presença digital completa com narrativa de autoridade. Inclui mapeamento de serviços, páginas de conversão, estrutura preparada para SEO e painel administrativo para gestão básica de conteúdo.",
    },
    {
      id: "item-long-booking",
      label: "Booking Detalhado",
      content:
        "Fluxo inteligente de agendamento com redução de etapas. Inclui integração com calendários (Google/Outlook), automação de e-mails de confirmação e interface desenhada para evitar abandono no checkout.",
    },
    {
      id: "item-long-stability",
      label: "Estabilidade Detalhado",
      content:
        "Acompanhamento técnico contínuo. Inclui monitoramento de uptime, correções de bugs, pequenas evoluções de UI/UX mensais e consultoria técnica para novas demandas do negócio.",
    },
  ],
}
