# kryndex-shared

Design system e módulos comuns aos apps Kryndex (informativo, painel, portal).

## Publicado como FONTE, não como bundle

O pacote tem JSX, classes do Tailwind e um import `?url` do Vite — um build perderia os
três. Quem compila é o Vite de cada app que o consome. Duas consequências que valem lembrar:

1. **Tudo o que este pacote importa (React, Radix, lucide) é dependência do app**, não daqui.
   Por isso estão em `peerDependencies`.
2. **O `styles.css` daqui não importa o `tailwindcss` nem declara `@source`.** Isso é
   responsabilidade do app: os `@source` só valem no arquivo que traz o Tailwind, e o app
   precisa apontar para o próprio `src` E para este pacote. Se isso morasse aqui, o app
   ficaria sem as classes das telas dele — e o build passaria sem um aviso.

O `baseHead()` recebe o CSS por parâmetro pelo mesmo motivo: quando ele importava a folha
daqui, a do app virava código morto.

## Consumo

```jsonc
// package.json do app
"@kryndex/shared": "github:Martins334/kryndex-shared#v0.1.0"
```

```ts
// vite.config.ts — "@shared" ANTES de "@": o alias do Vite casa por PREFIXO
alias: { "@shared": SHARED, "@": ... }
```

## Versão

Fixada por tag. Mudar algo aqui é: commit → tag → bump em cada app que quiser a mudança.
É o preço de repositórios independentes, e o que impede uma mudança daqui de quebrar os
três apps de uma vez sem aviso.

## Integração contínua

Este pacote não builda sozinho — é fonte, sem toolchain próprio. O workflow então faz o que
dá sinal de verdade: pega o `kryndex-site`, aponta o `@kryndex/shared` dele para o commit
atual e roda tipos, build e smoke. Pega "quebrei o botão" antes de a mudança virar tag.

Ele também **confere o CSS gerado**, que é onde este pacote falha calado: se o `@source` do
app deixar de enxergar o pacote, o build passa e as telas abrem sem estilo. O workflow exige
as classes do design system no CSS e um piso de tamanho.

**Secret necessário**: `GH_READ_TOKEN` — o `kryndex-site` é privado e precisa ser baixado.
