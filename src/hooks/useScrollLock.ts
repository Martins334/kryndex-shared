import { useEffect } from "react";

// Contador, e não um booleano: com dois modais abertos (o lightbox por cima de um diálogo),
// o de cima fecharia e destravaria a página com o de baixo ainda aberto.
let travas = 0;
let anterior: { html: string; body: string; padding: string } | null = null;

/**
 * Impede a página de fundo de rolar enquanto o modal está aberto.
 *
 * Os diálogos do Radix já fazem isso sozinhos. Dois modais do painel são feitos à mão
 * (`fixed inset-0` puro) e não travavam nada: a etiqueta e o lightbox de foto/vídeo.
 *
 * Por que `overflow: hidden` e não `position: fixed` no body — que é a receita mais comum e
 * a única confiável no Safari do iOS: a etiqueta chama `window.print()` com o modal aberto,
 * e a impressão depende de o body seguir no fluxo normal (styles.css esconde todo irmão que
 * não seja o portal). Com o body fixo e deslocado em `top: -Npx`, a etiqueta sairia cortada.
 * Trocar rolagem de fundo por impressão quebrada seria um mau negócio.
 *
 * `overflow: hidden` também dispensa restaurar a posição: sem mexer em `position`, a página
 * não salta para o topo ao travar nem ao destravar.
 */
export function useScrollLock(ativo: boolean): void {
  useEffect(() => {
    if (!ativo) return;

    const html = document.documentElement;
    const body = document.body;

    if (travas === 0) {
      anterior = { html: html.style.overflow, body: body.style.overflow, padding: body.style.paddingRight };
      // A barra de rolagem some junto com o overflow. Sem compensar a largura dela, a página
      // inteira desloca alguns pixels ao abrir o modal e volta ao fechar.
      const barra = window.innerWidth - html.clientWidth;
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      if (barra > 0) body.style.paddingRight = `${barra}px`;
    }
    travas += 1;

    return () => {
      travas -= 1;
      if (travas === 0 && anterior) {
        html.style.overflow = anterior.html;
        body.style.overflow = anterior.body;
        body.style.paddingRight = anterior.padding;
        anterior = null;
      }
    };
  }, [ativo]);
}
