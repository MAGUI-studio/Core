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
        "A MAGUI.studio propõe uma entrega premium focada em performance e conversão para a [Empresa]. O objetivo é estruturar uma experiência digital que não apenas apresente a marca, mas conduza o usuário para a próxima ação com clareza, velocidade e uma narrativa comercial consistente.",
    },
    {
      id: "exec-institucional",
      label: "Institucional e Autoridade",
      content:
        "Esta proposta foi desenhada para elevar o posicionamento e a percepção de autoridade da [Empresa]. Estruturamos uma presença digital séria, clara e tecnicamente consistente, alinhada com a experiência que o cliente final espera de uma marca confiável.",
    },
    {
      id: "exec-growth",
      label: "Estrutura para Crescimento",
      content:
        "Esta proposta organiza a presença digital da [Empresa] como um ativo comercial sólido, preparado para comunicar valor com clareza, reduzir ruído operacional e sustentar crescimento com uma base técnica confiável.",
    },
  ],
  objectives: [
    {
      id: "obj-lp",
      label: "Landing Page",
      content:
        "O objetivo deste projeto é otimizar a conversão e a velocidade de resposta, apresentando a oferta da [Empresa] com clareza e conduzindo o visitante para uma ação comercial direta sem distrações desnecessárias.",
    },
    {
      id: "obj-inst",
      label: "Institucional",
      content:
        "O objetivo deste projeto é consolidar a presença institucional da [Empresa], organizar a apresentação dos serviços e transmitir uma percepção imediata de profissionalismo, autoridade e confiança.",
    },
  ],
  expectedImpact: [
    {
      id: "imp-clarity",
      label: "Clareza e confiança",
      content:
        "A expectativa é aumentar a percepção de valor da marca, facilitar a tomada de decisão do cliente final e reduzir o atrito comercial causado por comunicação confusa ou estrutura digital fraca.",
    },
    {
      id: "imp-speed",
      label: "Velocidade de decisão",
      content:
        "Com uma experiência mais objetiva, rápida e bem organizada, o ciclo de resposta tende a ficar menor e a jornada de contato se torna mais eficiente para o visitante.",
    },
    {
      id: "imp-positioning",
      label: "Posicionamento premium",
      content:
        "A entrega fortalece o posicionamento da empresa ao apresentar a marca com linguagem visual mais madura, melhor leitura de valor e uma experiência compatível com um serviço profissional.",
    },
  ],
  differentials: [
    {
      id: "diff-governance",
      label: "Governança e cadência",
      content:
        "A condução do projeto acontece com checkpoints claros, critérios de aceite objetivos e uma rotina operacional documentada, o que reduz ruído, retrabalho e ambiguidades durante a execução.",
    },
    {
      id: "diff-documentation",
      label: "Rigor técnico",
      content:
        "A MAGUI.studio não entrega apenas uma página final pronta. Entrega uma estrutura técnica sólida, com foco em performance, previsibilidade de manutenção e padrão profissional de implementação.",
    },
    {
      id: "diff-performance",
      label: "Performance e experiência",
      content:
        "O projeto é pensado para carregar rápido, funcionar bem em dispositivos móveis e transmitir seriedade desde o primeiro contato, sem depender de soluções improvisadas ou visuais genéricos.",
    },
  ],
  timeline: [
    {
      id: "time-standard",
      label: "Padrão comercial",
      content:
        "O cronograma é contado em dias úteis e só começa após a validação do briefing e o envio dos ativos obrigatórios pelo cliente no CRM da MAGUI.studio.",
    },
  ],
  paymentTerms: [
    {
      id: "pay-kickoff",
      label: "Entrada + saldo final",
      content:
        "O pagamento é dividido em duas etapas: 50% no ato da aprovação e assinatura, para reserva de agenda e início da estruturação, e 50% após a aprovação final em homologação, obrigatoriamente antes da publicação em produção. A cobrança é realizada pela plataforma via link seguro do Stripe, com opções como cartão de crédito e boleto bancário.",
    },
  ],
  platformFlow: [
    {
      id: "plat-default",
      label: "Fluxo oficial pelo CRM",
      content:
        "Toda a comunicação, aprovações, envio de materiais e acompanhamento das etapas acontece pela plataforma oficial da MAGUI.studio. Isso preserva histórico, reduz ruído operacional e garante rastreabilidade real de tudo o que foi solicitado, aprovado e entregue.",
    },
  ],
  nextSteps: [
    {
      id: "next-standard",
      label: "Fechamento e início",
      content:
        "A sequência prevista para início do projeto é simples e objetiva: aprovação da proposta comercial, assinatura do contrato digital, pagamento do sinal de 50%, preenchimento do briefing no CRM e envio dos ativos obrigatórios para liberação oficial do cronograma.",
    },
  ],
  acceptanceCriteria: [
    {
      id: "acc-operational",
      label: "Entrega validada",
      content:
        "A entrega será considerada aprovada quando a solução refletir o escopo validado nos checkpoints, apresentar funcionamento correto em dispositivos modernos, manter consistência visual com a direção aprovada e cumprir os objetivos comerciais definidos para a proposta.",
    },
    {
      id: "acc-quality",
      label: "Qualidade técnica",
      content:
        "Os critérios de aceite consideram estabilidade da interface, responsividade, funcionamento de links e formulários, integridade dos blocos visuais e coerência entre a proposta aprovada e a entrega publicada em ambiente de homologação.",
    },
  ],
  notIncluded: [
    {
      id: "not-scope",
      label: "Escopo excluído",
      content:
        "Não fazem parte do escopo padrão a gestão de redes sociais, a criação contínua de posts e artes, o gerenciamento de tráfego pago, a redação publicitária integral e o licenciamento de ativos de terceiros que envolvam custo adicional para a operação.",
    },
    {
      id: "not-infra",
      label: "Custos externos e continuidade",
      content:
        "Custos de plataformas externas, APIs pagas, ativos premium e renovações futuras não estão incluídos além do que estiver explicitamente descrito nesta proposta. Após o primeiro ciclo de 12 meses, a continuidade da estrutura depende das regras comerciais de renovação e permanência vigentes.",
    },
  ],
  warranty: [
    {
      id: "war-30days",
      label: "Garantia e ajustes",
      content:
        "Cada etapa contempla 02 rodadas de ajustes consolidados durante a execução. Após o lançamento, a garantia de 30 dias cobre exclusivamente correções de bugs técnicos dentro do escopo aprovado, sem incluir novas funcionalidades ou mudanças estratégicas fora do combinado.",
    },
  ],
  itemDescriptions: [
    {
      id: "item-desc-lp",
      label: "Landing Page",
      content: "Landing page comercial de alta conversão",
    },
    {
      id: "item-desc-inst",
      label: "Institucional",
      content: "Website institucional com foco em autoridade",
    },
  ],
  itemLongDescriptions: [
    {
      id: "item-long-lp",
      label: "Landing Page detalhada",
      content:
        "Estrutura pensada para conversão direta, com narrativa comercial clara, design responsivo, integração com formulários ou WhatsApp e otimização para desempenho rápido em dispositivos móveis.",
    },
    {
      id: "item-long-inst",
      label: "Institucional detalhado",
      content:
        "Presença digital institucional com organização clara dos serviços, leitura de autoridade da marca, páginas estratégicas e estrutura técnica preparada para performance, confiança e boa navegação.",
    },
  ],
}
