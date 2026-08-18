// Reporter de erro neutro para o error boundary raiz. Hoje só registra no console;
// ponto de extensão para plugar um serviço (ex.: Sentry) no futuro.
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  console.error("[app-error]", error, {
    route: window.location.pathname,
    ...context,
  });
}
