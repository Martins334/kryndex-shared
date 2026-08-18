import * as Sentry from "@sentry/react";

// Inicializa o Sentry no cliente se VITE_SENTRY_DSN estiver setado.
// No-op no servidor (SSR) e quando não há DSN.
export function initSentry(): void {
  if (typeof window === "undefined") return;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;
  Sentry.init({ dsn, environment: import.meta.env.MODE });
}
