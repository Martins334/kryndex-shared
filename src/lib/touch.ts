// Detecção de aparelho com teclado VIRTUAL, usada para não focar campo de texto
// automaticamente — no celular isso faz o teclado subir sozinho e espremer o modal
// contra a metade de cima da tela.
//
// É função pura, NÃO hook, de propósito: precisa ser chamada dentro de handlers e no
// corpo do render sem virar estado. O `useIsMobile` de hooks/use-mobile.tsx não serve
// aqui — ele retorna `false` no primeiro render (SSR), que é justamente o momento em
// que o foco automático aconteceria.
//
// `pointer: coarse` e não largura de tela: o que importa é ter teclado virtual, não o
// tamanho do viewport (um desktop com janela estreita continua tendo teclado físico).
export function isCoarsePointer(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(pointer: coarse)").matches;
}

/**
 * Handler de `onOpenAutoFocus` compartilhado pelos overlays (Dialog, Sheet, AlertDialog).
 *
 * Por padrão o Radix foca o primeiro elemento focável ao abrir — que num formulário é o
 * primeiro campo de texto, e no celular isso sobe o teclado sozinho e espreme o modal.
 * Em aparelho de toque movemos o foco para o CONTAINER do modal, em vez de só cancelar:
 * assim o foco ainda ENTRA no diálogo (Esc funciona, a armadilha de foco fecha, o leitor
 * de tela anuncia), apenas não cai num campo. Cancelar sem redirecionar deixaria o foco
 * no gatilho, fora do modal.
 *
 * Mora aqui, e não em dialog.tsx, para os três primitivos compartilharem sem que um
 * arquivo de componentes passe a exportar função solta.
 */
export function handleOverlayOpenAutoFocus(e: Event, userHandler?: (event: Event) => void): void {
  userHandler?.(e);
  if (e.defaultPrevented) return;
  if (!isCoarsePointer()) return; // desktop: mantém o comportamento padrão do Radix
  e.preventDefault();
  (e.currentTarget as HTMLElement | null)?.focus({ preventScroll: true });
}
