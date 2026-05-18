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
      label: "Performance e Conversao",
      content:
        "A MAGUI.studio propoe uma entrega premium focada em performance e conversao para a [Empresa]. O objetivo e estruturar uma experiencia digital que nao apenas apresente a marca, mas conduza o usuario para a proxima acao com clareza, velocidade e uma narrativa comercial consistente.",
    },
    {
      id: "exec-institucional",
      label: "Institucional e Autoridade",
      content:
        "Esta proposta foi desenhada para elevar o posicionamento e a percepcao de autoridade da [Empresa]. Estruturamos uma presenca digital seria, clara e tecnicamente consistente, alinhada com a experiencia que o cliente final espera de uma marca confiavel.",
    },
    {
      id: "exec-growth",
      label: "Estrutura para Crescimento",
      content:
        "Esta proposta organiza a presenca digital da [Empresa] como um ativo comercial solido, preparado para comunicar valor com clareza, reduzir ruido operacional e sustentar crescimento com uma base tecnica confiavel.",
    },
  ],
  objectives: [
    {
      id: "obj-lp",
      label: "Landing Page",
      content:
        "O objetivo deste projeto e otimizar a conversao e a velocidade de resposta, apresentando a oferta da [Empresa] com clareza e conduzindo o visitante para uma acao comercial direta sem distrações desnecessarias.",
    },
    {
      id: "obj-inst",
      label: "Institucional",
      content:
        "O objetivo deste projeto e consolidar a presenca institucional da [Empresa], organizar a apresentacao dos servicos e transmitir uma percepcao imediata de profissionalismo, autoridade e confianca.",
    },
  ],
  expectedImpact: [
    {
      id: "imp-clarity",
      label: "Clareza e confianca",
      content:
        "A expectativa e aumentar a percepcao de valor da marca, facilitar a tomada de decisao do cliente final e reduzir o atrito comercial causado por comunicacao confusa ou estrutura digital fraca.",
    },
    {
      id: "imp-speed",
      label: "Velocidade de decisao",
      content:
        "Com uma experiencia mais objetiva, rapida e bem organizada, o ciclo de resposta tende a ficar menor e a jornada de contato se torna mais eficiente para o visitante.",
    },
    {
      id: "imp-positioning",
      label: "Posicionamento premium",
      content:
        "A entrega fortalece o posicionamento da empresa ao apresentar a marca com linguagem visual mais madura, melhor leitura de valor e uma experiencia compativel com um servico profissional.",
    },
  ],
  differentials: [
    {
      id: "diff-governance",
      label: "Governanca e cadencia",
      content:
        "A conducao do projeto acontece com checkpoints claros, criterios de aceite objetivos e uma rotina operacional documentada, o que reduz ruido, retrabalho e ambiguidades durante a execucao.",
    },
    {
      id: "diff-documentation",
      label: "Rigor tecnico",
      content:
        "A MAGUI.studio nao entrega apenas uma pagina final pronta. Entrega uma estrutura tecnica solida, com foco em performance, previsibilidade de manutencao e padrao profissional de implementacao.",
    },
    {
      id: "diff-performance",
      label: "Performance e experiencia",
      content:
        "O projeto e pensado para carregar rapido, funcionar bem em dispositivos moveis e transmitir seriedade desde o primeiro contato, sem depender de solucoes improvisadas ou visuais genericos.",
    },
  ],
  timeline: [
    {
      id: "time-standard",
      label: "Padrao comercial",
      content:
        "O cronograma e contado em dias uteis e so comeca apos a validacao do briefing e o envio dos ativos obrigatorios pelo cliente no CRM da MAGUI.studio. Para este projeto, dias uteis correspondem a segunda-feira a sexta-feira, excluidos sabados, domingos, feriados nacionais e feriados municipais de Sao Jose dos Campos/SP.",
    },
  ],
  paymentTerms: [
    {
      id: "pay-kickoff",
      label: "Entrada + saldo final",
      content:
        "O fluxo financeiro do projeto ocorre em duas fases: uma entrada de 50% mediante a assinatura do contrato de prestacao de servicos, para alocacao de recursos e inicio imediato do design, e os 50% finais condicionados a aprovacao do projeto em homologacao, obrigatoriamente antes do deploy em producao. O faturamento e realizado via link seguro da Stripe atraves da infraestrutura da MAGUI.studio, com opcoes de pagamento via boleto bancario e cartao de credito.",
    },
  ],
  platformFlow: [
    {
      id: "plat-default",
      label: "Fluxo oficial pelo CRM",
      content:
        "Toda a comunicacao, aprovacoes, envio de materiais e acompanhamento das etapas acontece pela plataforma oficial da MAGUI.studio. Isso preserva historico, reduz ruido operacional e garante rastreabilidade real de tudo o que foi solicitado, aprovado e entregue.",
    },
  ],
  nextSteps: [
    {
      id: "next-standard",
      label: "Fechamento e inicio",
      content:
        "A sequencia prevista para inicio do projeto e simples e objetiva: aprovacao da proposta comercial, assinatura do contrato digital, pagamento do sinal de 50%, preenchimento do briefing no CRM e envio dos ativos obrigatorios para liberacao oficial do cronograma.",
    },
  ],
  acceptanceCriteria: [
    {
      id: "acc-operational",
      label: "Entrega validada",
      content:
        "A entrega sera considerada aprovada quando a solucao refletir o escopo validado nos checkpoints, apresentar funcionamento correto em dispositivos modernos, manter consistencia visual com a direcao aprovada e cumprir os objetivos comerciais definidos para a proposta.",
    },
    {
      id: "acc-quality",
      label: "Qualidade tecnica",
      content:
        "Os criterios de aceite consideram estabilidade da interface, responsividade, funcionamento de links e formularios, integridade dos blocos visuais e coerencia entre a proposta aprovada e a entrega publicada em ambiente de homologacao.",
    },
  ],
  notIncluded: [
    {
      id: "not-scope",
      label: "Escopo excluido",
      content:
        "Nao fazem parte do escopo padrao a gestao de redes sociais, a criacao continua de posts e artes, o gerenciamento de trafego pago, a redacao publicitaria integral e o licenciamento de ativos de terceiros que envolvam custo adicional para a operacao.",
    },
    {
      id: "not-infra",
      label: "Custos externos e continuidade",
      content:
        "Custos de plataformas externas, APIs pagas, ativos premium e renovacoes futuras nao estao incluidos alem do que estiver explicitamente descrito nesta proposta. Apos o primeiro ciclo de 12 meses, a continuidade da estrutura depende das regras comerciais de renovacao e permanencia vigentes.",
    },
  ],
  warranty: [
    {
      id: "war-30days",
      label: "Garantia e ajustes",
      content:
        "Cada etapa contempla 02 rodadas de ajustes consolidados durante a execucao. Apos o lancamento, a garantia de 30 dias cobre exclusivamente correcoes de bugs tecnicos dentro do escopo aprovado, sem incluir novas funcionalidades ou mudancas estrategicas fora do combinado.",
    },
  ],
  itemDescriptions: [
    {
      id: "item-desc-lp",
      label: "Landing Page",
      content: "Landing page comercial de alta conversao",
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
        "Estrutura pensada para conversao direta, com narrativa comercial clara, design responsivo, integracao com formularios ou WhatsApp e otimizacao para desempenho rapido em dispositivos moveis.",
    },
    {
      id: "item-long-inst",
      label: "Institucional detalhado",
      content:
        "Presenca digital institucional com organizacao clara dos servicos, leitura de autoridade da marca, paginas estrategicas e estrutura tecnica preparada para performance, confianca e boa navegacao.",
    },
  ],
}
