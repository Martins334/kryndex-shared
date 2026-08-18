import { QueryClient } from "@tanstack/react-query";
import { createRouter, type AnyRoute } from "@tanstack/react-router";
import { initSentry } from "./lib/sentry";

initSentry();

// Configuração de router comum aos três apps. Só a árvore de rotas difere — e é justamente
// ela que separa os sistemas: cada build importa apenas as suas, então uma rota do painel
// não é sequer avaliada no servidor do informativo.
export function makeRouter(routeTree: AnyRoute) {
  const queryClient = new QueryClient();

  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
  });
}
