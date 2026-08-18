import { useAuthStore } from "../stores/authStore";
import { PORTAL_BASE } from "./appUrls";

// Monta links do PORTAL DO CLIENTE gerados dentro do painel (checklist, acompanhar,
// aceite, garantia, devolução, cupom, documento, avaliar).
//
// Por que a loja precisa ir na URL: esses links são abertos no aparelho do cliente,
// onde não existe sessão nem slug no caminho. Sem `?store=`, `resolveStoreSlug()`
// cai na loja padrão e a API responde 404 — foi exatamente o "link inválido" do
// checklist.
//
// A base vem de `PORTAL_BASE` (VITE_PORTAL_URL), e não mais de um `LANDING_BASE` próprio.
// Existiam DUAS constantes para o mesmo conceito, e foi isso que causou o defeito: os
// builds passaram a receber `VITE_PORTAL_URL` e a antiga `VITE_LANDING_URL` virou variável
// morta. Vazia, ela caía em `window.location.origin` — que no painel é o domínio do PAINEL.
// Todo link entregue ao cliente (inclusive o QR impresso na etiqueta e na OS física) saía
// apontando para dash.kryndex.com em vez do portal.

export function portalLink(path: string, extra?: Record<string, string | undefined>): string {
  const qs = new URLSearchParams();
  const slug = useAuthStore.getState().activeStore?.slug;
  if (slug) qs.set("store", slug);
  for (const [k, v] of Object.entries(extra ?? {})) if (v) qs.set(k, v);
  const q = qs.toString();
  return `${PORTAL_BASE}${path}${q ? `?${q}` : ""}`;
}
