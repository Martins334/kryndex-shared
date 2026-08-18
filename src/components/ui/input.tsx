import * as React from "react";

import { cn } from "../../lib/utils";
import { isCoarsePointer } from "../../lib/touch";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  // Limite de caracteres padrão (evita textos gigantes no banco). Um `maxLength` explícito
  // passado pelo campo prevalece; `type="number"` ignora `maxLength` no browser (sem efeito).
  ({ className, type, maxLength = 255, autoFocus, ...props }, ref) => {
    return (
      <input
        type={type}
        maxLength={maxLength}
        // No celular o `autoFocus` fazia o teclado subir sozinho ao abrir o modal (ou a
        // página), empurrando o conteúdo para fora da tela. Vale só em ponteiro fino,
        // onde focar o primeiro campo ajuda quem usa teclado. Tratado AQUI, e não nos
        // ~18 campos que usam esta prop, para a regra valer no sistema inteiro.
        autoFocus={autoFocus && !isCoarsePointer()}
        className={cn(
          "flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors md:h-9 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
