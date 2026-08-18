import { apiFetch } from "../lib/api";

export type Plan = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  priceCents: number | null; // preço mensal; null = "Sob consulta"
  priceCentsYearly: number | null; // preço anual total; null = sem opção anual
  currency: string;
  interval: string; // month | year
  features: string[];
  highlight: boolean;
  active: boolean;
  isPublic: boolean;
  sortOrder: number;
  ctaLabel: string | null;
  // Limites de upload (null = ilimitado)
  allowVideo: boolean;
  maxImageMb: number | null;
  maxVideoMb: number | null;
  maxFilesPerOrder: number | null;
  storageQuotaMb: number | null;
  // Preço recorrente anual no Stripe. Vazio = a cobrança anual NÃO existe, mesmo que
  // `priceCentsYearly` esteja preenchido — é este campo que decide se dá para cobrar.
  stripePriceIdYearly?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlanInput = {
  name: string;
  slug?: string;
  tagline?: string | null;
  priceCents?: number | null;
  priceCentsYearly?: number | null;
  interval?: string;
  features?: string[];
  highlight?: boolean;
  active?: boolean;
  isPublic?: boolean;
  sortOrder?: number;
  ctaLabel?: string | null;
  allowVideo?: boolean;
  maxImageMb?: number | null;
  maxVideoMb?: number | null;
  maxFilesPerOrder?: number | null;
  storageQuotaMb?: number | null;
};

// Catálogo completo (super-admin)
export const listPlans = () => apiFetch<Plan[]>("/admin/plans");

export const createPlan = (data: PlanInput) =>
  apiFetch<Plan>("/admin/plans", { method: "POST", body: JSON.stringify(data) });

export const updatePlan = (id: string, patch: Partial<PlanInput>) =>
  apiFetch<Plan>(`/admin/plans/${id}`, { method: "PATCH", body: JSON.stringify(patch) });

export const deletePlan = (id: string) =>
  apiFetch<void>(`/admin/plans/${id}`, { method: "DELETE" });

// Planos públicos (para landing e /precos) — fetch sem token, nunca dispara redirect de sessão.
export async function fetchPublicPlans(): Promise<Plan[]> {
  const base = (import.meta.env.VITE_API_URL as string) ?? "/api/v1";
  const res = await fetch(`${base}/public/plans`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<Plan[]>;
}
