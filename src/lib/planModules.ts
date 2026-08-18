// Módulos liberados por plano (por slug). MANTER EM SINCRONIA com o backend
// (elitecell-api/src/constants/planModules.ts). Herança: gratis ⊂ balcao ⊂ laboratorio.

const GRATIS = ["os", "clientes", "portal", "termos", "garantias", "configuracoes", "bancada"];

const BALCAO = [
  ...GRATIS,
  "agendamentos", "posvenda",
  "estoque", "compras", "revenda", "cupons", "fidelidade",
  "tecnicos", "aparelhos", "dispositivos",
  "caixa", "comissoes", "relatorios", "precificacao", "templates", "usuarios",
];

const LABORATORIO = [
  ...BALCAO,
  "transferencias", "analytics", "ranking", "cargos", "lojas",
  "central-tecnica",
];

export const PLAN_MODULES: Record<string, string[]> = {
  gratis: GRATIS,
  balcao: BALCAO,
  laboratorio: LABORATORIO,
};

export const PLAN_LABEL: Record<string, string> = {
  gratis: "Grátis",
  balcao: "Balcão",
  laboratorio: "Laboratório",
};

// Nome amigável de cada módulo — usado na tela de recurso bloqueado.
export const MODULE_LABEL: Record<string, string> = {
  bancada: "Bancada",
  agendamentos: "Agendamentos",
  posvenda: "Pós-venda",
  fidelidade: "Fidelidade",
  estoque: "Estoque",
  compras: "Pedidos de Compra",
  revenda: "Vitrine online",
  cupons: "Cupons",
  transferencias: "Transferências",
  caixa: "Caixa",
  comissoes: "Comissões",
  precificacao: "Tabela de Preços",
  ranking: "Ranking de indicações",
  relatorios: "Relatórios",
  analytics: "Analytics",
  aparelhos: "Aparelhos",
  dispositivos: "Dispositivos",
  tecnicos: "Técnicos",
  usuarios: "Usuários",
  cargos: "Cargos",
  lojas: "Lojas",
  templates: "Personalização de documentos",
  "central-tecnica": "Central Técnica",
};

// O que cada recurso faz — mostrado no card da tela bloqueada por plano.
export const MODULE_DESCRIPTION: Record<string, string> = {
  bancada: "Acompanha o reparo na bancada: diagnóstico, andamento das OS e sessões de trabalho por técnico.",
  agendamentos: "Agenda de atendimentos e serviços, com horários e confirmação ao cliente.",
  posvenda: "Pesquisa de satisfação (NPS) e acompanhamento pós-entrega para fidelizar o cliente.",
  fidelidade: "Programa de pontos e recompensas para clientes recorrentes.",
  estoque: "Controle de produtos e peças: quantidades, movimentações e alertas de baixo estoque.",
  compras: "Pedidos de compra a fornecedores para repor peças e produtos do estoque.",
  revenda: "Vitrine online de produtos à venda, publicada no seu portal para os clientes.",
  cupons: "Cupons de desconto para promoções e campanhas.",
  transferencias: "Transferência de produtos e estoque entre suas lojas.",
  caixa: "Controla o fluxo de dinheiro da loja: abertura e fechamento de caixa, entradas, saídas e sangrias.",
  comissoes: "Cálculo e controle das comissões dos técnicos por serviço.",
  precificacao: "Tabela de preços de serviços e peças para orçar com agilidade.",
  ranking: "Ranking mensal de indicações dos clientes (programa Indique e ganhe), com prêmios e regras.",
  relatorios: "Relatórios essenciais do negócio: OS, faturamento e produtividade.",
  analytics: "Análises avançadas com gráficos e indicadores de desempenho da loja.",
  aparelhos: "Cadastro dos aparelhos atendidos, com histórico e informações técnicas.",
  dispositivos: "Catálogo de modelos de dispositivos para agilizar o cadastro de OS.",
  tecnicos: "Cadastro e gestão dos técnicos da assistência.",
  usuarios: "Gestão de usuários (funcionários) com acesso ao sistema.",
  cargos: "Cargos personalizados com permissões específicas por função.",
  lojas: "Gestão de múltiplas lojas/filiais da sua conta.",
  templates: "Personalização de documentos (OS, recibos) com a sua identidade.",
  "central-tecnica":
    "Acervo técnico de bancada: esquemas elétricos, boardviews interativos, códigos secretos por marca, abreviações de placa e guias de diagnóstico.",
};

// Slug nulo → piso "grátis"; slug desconhecido (planos legados) → não bloqueia.
export function planHasModule(slug: string | null | undefined, module: string): boolean {
  const mods = PLAN_MODULES[slug ?? "gratis"];
  if (!mods) return true;
  return mods.includes(module);
}

// Menor plano (label) que inclui o módulo — para a mensagem de upgrade.
export function minPlanForModule(module: string): string {
  if (GRATIS.includes(module)) return "Grátis";
  if (BALCAO.includes(module)) return "Balcão";
  return "Laboratório";
}
