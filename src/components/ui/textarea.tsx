import * as React from "react";

import { cn } from "../../lib/utils";
import { isCoarsePointer } from "../../lib/touch";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  // Limite de caracteres padrão para textos longos; um `maxLength` explícito prevalece.
  ({ className, maxLength = 2000, autoFocus, ...props }, ref) => {
    return (
      <textarea
        maxLength={maxLength}
        // Mesma regra do Input: no toque o autoFocus sobe o teclado sozinho. Hoje nenhum
        // Textarea usa a prop — está aqui para o primeiro que usar não reabrir o bug.
        autoFocus={autoFocus && !isCoarsePointer()}
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
