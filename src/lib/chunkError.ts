// Recuperação de chunk que sumiu.
//
// As rotas são carregadas por import dinâmico e o nome do arquivo traz hash do
// conteúdo. Depois de um deploy os hashes mudam: quem estava com a aba aberta ainda
// aponta para os antigos e, ao navegar, o import bate num 404 (ou num 502 durante a
// troca do container) e a app cai no error boundary. Recarregar resolve — a página
// nova vem com os hashes novos —, então fazemos isso em vez de mostrar a tela de erro.

// Cada navegador redige a falha de import à sua maneira; comparamos em minúsculas.
const CHUNK_ERROR_PATTERNS = [
  "failed to fetch dynamically imported module", // Chrome/Edge
  "error loading dynamically imported module", // Firefox
  "importing a module script failed", // Safari
  "failed to load module script", // Chrome, MIME/404 na resposta
  "unable to preload css", // helper de preload do Vite
];

// Momento do último recarregamento automático, por aba. `sessionStorage` (e não
// `localStorage`) para não vazar entre abas nem sobreviver ao fechamento.
const LAST_RELOAD_KEY = "kryndex:chunk-reload-at";

// Janela de contenção: se a app quebrar de novo logo após um recarregamento, é sinal de
// que recarregar não resolve — aí a tela de erro aparece em vez de entrarmos em laço.
const RELOAD_COOLDOWN_MS = 20_000;

export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : "";
  const lower = message.toLowerCase();
  return CHUNK_ERROR_PATTERNS.some((pattern) => lower.includes(pattern));
}

/** É uma falha de chunk E ainda não recarregamos por isso há pouco? */
export function canRecoverFromChunkError(error: unknown): boolean {
  if (typeof window === "undefined") return false;
  if (!isChunkLoadError(error)) return false;
  try {
    const last = Number(window.sessionStorage.getItem(LAST_RELOAD_KEY)) || 0;
    return Date.now() - last > RELOAD_COOLDOWN_MS;
  } catch {
    // sessionStorage bloqueado (modo restrito) — sem como evitar laço, não recarrega.
    return false;
  }
}

/** Marca a tentativa e recarrega. Chamar só depois de `canRecoverFromChunkError`. */
export function reloadForChunkError(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(LAST_RELOAD_KEY, String(Date.now()));
  } catch {
    return;
  }
  window.location.reload();
}
