/**
 * Endereços dos quatro apps.
 *
 * Depois da separação, um link entre sistemas não pode mais ser um caminho: `/planos` no
 * informativo aponta para o próprio informativo, não para o painel. Quem cruza a fronteira
 * precisa de URL absoluta, e ela vem daqui.
 *
 * `||` e não `??`, de propósito: uma variável CRIADA E VAZIA no painel do host entrega
 * string vazia, que passa pelo `??` e produziria link sem domínio. Já aconteceu — era o
 * motivo de os links de cupom saírem como "/cupom/CODIGO".
 *
 * Vazio = mesma origem. É o que vale em dev, onde `npm run dev:*` sobe cada app numa porta
 * e o .env aponta para elas; e é o comportamento seguro se alguém esquecer de configurar.
 */
function base(v: string | undefined): string {
  return v || (typeof window !== "undefined" ? window.location.origin : "");
}

/** Informativo — kryndex.com */
export const SITE_BASE = base(import.meta.env.VITE_SITE_URL as string | undefined);

/** Painel do lojista — dash.kryndex.com */
export const PAINEL_BASE = base(import.meta.env.VITE_PAINEL_URL as string | undefined);

/** Portal do cliente — portal.kryndex.com */
export const PORTAL_BASE = base(import.meta.env.VITE_PORTAL_URL as string | undefined);

/** Demonstração — demo.kryndex.com (mesmo build do painel) */
export const DEMO_BASE = base(import.meta.env.VITE_DEMO_URL as string | undefined);
