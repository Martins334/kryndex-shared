import type { Plan } from "../data/plans";

// Preço de um plano segundo o ciclo escolhido. Uma função só para as três telas que mostram
// preço (cards da landing, tabela de comparação e a aba de planos do painel) — antes cada uma
// formatava do seu jeito, e com dois ciclos isso viraria três versões da mesma regra.

export type BillingCycle = "month" | "year";

/**
 * O plano tem cobrança anual? Vale para exibir E para cobrar — a decisão é a mesma.
 *
 * Exige as DUAS coisas: preço anual definido e `stripePriceIdYearly` presente. Só o preço não
 * basta — ele é o número que a página mostra, enquanto o Price ID é o que o Stripe precisa
 * para cobrar. Checar apenas o preço fazia a aba "Anual" aparecer sem cobrança anual por trás,
 * e o clique voltava 400 ("Este plano ainda não está disponível para cobrança online", ou
 * "No such price" quando o ID aponta para outra conta do Stripe).
 */
export function hasYearly(plan: Pick<Plan, "priceCentsYearly" | "stripePriceIdYearly">): boolean {
  return plan.priceCentsYearly != null && plan.priceCentsYearly > 0 && !!plan.stripePriceIdYearly;
}

const brl = (cents: number) => `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;

export type PriceParts = {
  /** Valor em destaque. */
  big: string;
  /** "/mês", "/ano" ou vazio (grátis / sob consulta). */
  suffix: string;
  /** Linha de apoio: no anual, o equivalente mensal e a economia. */
  note: string | null;
};

/**
 * Plano sem preço anual cai para o mensal mesmo com `cycle: "year"`.
 *
 * Isso não é só cosmético: o backend recusa o checkout anual de um plano sem
 * `stripePriceIdYearly` (billing.controller.ts, "Este plano ainda não está disponível para
 * cobrança online"). Exibição e cobrança usam esta mesma função e o `hasYearly` acima, então
 * não há como a tela oferecer um ciclo que a cobrança não aceita.
 */
export function planPriceFor(plan: Plan, cycle: BillingCycle): PriceParts {
  if (plan.priceCents == null) return { big: "Sob consulta", suffix: "", note: null };
  if (plan.priceCents === 0) return { big: "Grátis", suffix: "", note: null };

  if (cycle === "year" && hasYearly(plan)) {
    const yearly = plan.priceCentsYearly!;
    const perMonth = Math.round(yearly / 12);
    const saved = plan.priceCents * 12 - yearly;
    const monthsFree = saved / plan.priceCents;
    // "2 meses grátis" só é dito quando a conta fecha redondo; fora disso, a economia em reais.
    const gain =
      Number.isInteger(monthsFree) && monthsFree >= 1
        ? `${monthsFree} ${monthsFree === 1 ? "mês" : "meses"} grátis`
        : `economia de ${brl(saved)}`;
    return { big: brl(yearly), suffix: "/ano", note: `equivale a ${brl(perMonth)}/mês · ${gain}` };
  }

  return { big: brl(plan.priceCents), suffix: "/mês", note: null };
}
