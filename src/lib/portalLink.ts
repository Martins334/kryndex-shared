import { useAuthStore } from "../stores/authStore";

// Monta links do PORTAL DO CLIENTE gerados dentro do admin (checklist, acompanhar,
// aceite, garantia, devolução, cupom, documento, avaliar).
//
// Por que a loja precisa ir na URL: esses links são abertos no aparelho do cliente,
// onde não existe sessão nem slug no caminho. Sem `?store=`, `resolveStoreSlug()`
// cai na loja padrão e a API responde 404 — foi exatamente o "link inválido" do
// checklist. Antes disso a loja vinha de `VITE_STORE_SLUG`, que só existia quando
// cada loja tinha o seu próprio deploy do tech-landing; no app único ela não existe.
/**
 * Base absoluta dos links do portal. Origem única — havia oito cópias desta linha pelo
 * projeto, e duas delas usavam `??` no lugar de `||`.
 *
 * A diferença não é estilo: `VITE_LANDING_URL` existe no .env porém VAZIA (o portal é o
 * mesmo app). `??` só cai no padrão quando o valor é null ou undefined — string vazia
 * passa. As duas cópias com `??` produziam base vazia, e o link compartilhado saía como
 * "/cupom/CODIGO" em vez de "https://dominio/cupom/CODIGO".
 */
export const LANDING_BASE =
  (import.meta.env.VITE_LANDING_URL as string | undefined) ||
  (typeof window !== "undefined" ? window.location.origin : "");

export function portalLink(path: string, extra?: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  const slug = useAuthStore.getState().activeStore?.slug;
  if (slug) qs.set("store", slug);
  for (const [k, v] of Object.entries(extra ?? {})) if (v) qs.set(k, v);
  const q = qs.toString();
  return `${LANDING_BASE}${path}${q ? `?${q}` : ""}`;
}
