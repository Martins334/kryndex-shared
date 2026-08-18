/**
 * O CSS vem por PARÂMETRO, e não de um import daqui: a folha que vale é a do app, que
 * importa o tema deste pacote E declara os `@source`. Quando este arquivo importava o
 * styles.css do próprio pacote, o do app virava código morto — as telas do app saíam sem
 * as classes delas, e o build passava sem um aviso.
 *
 * Cabeçalho comum. Cada app passa o próprio título e descrição — são o que aparece na aba,
 * no resultado de busca e no compartilhamento, e os três têm público diferente.
 */
export function baseHead(opts: { title: string; description: string; appCss: string }) {
  return {
    meta: [
      { charSet: "utf-8" },
      // `viewport-fit=cover` liga os `env(safe-area-inset-*)` que a bottom nav e o
      // <main> já usam — sem ele esses valores são 0 e o app não ocupa a tela toda
      // em aparelho com entalhe. Inofensivo no navegador comum.
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: opts.title },
      { name: "description", content: opts.description },
      { name: "author", content: "Kryndex" },
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: opts.appCss },
      { rel: "icon", href: "/icon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon-180x180.png" },
    ],
  };
}
