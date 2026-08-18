import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { Button } from "./button";
import { PAGE_ELLIPSIS, pageRange } from "../../lib/pageRange";
import { cn } from "../../lib/utils";

/**
 * Paginação numerada com reticências: ‹ 1 2 [3] 4 5 … 33 ›
 *
 * A primeira e a última página estão SEMPRE visíveis; o meio é uma janela em volta da
 * atual. No mobile a janela encolhe (1 vizinho em vez de 2) — com 2 a faixa estourava
 * os 360px e gerava rolagem horizontal.
 */
export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
}: {
  /** 1-indexado. */
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}) {
  const narrow = useNarrowViewport();
  if (pageCount <= 1) return null;

  const pages = pageRange(page, pageCount, narrow ? 1 : 2);

  return (
    <nav aria-label="Paginação" className={cn("flex flex-wrap items-center justify-center gap-1", className)}>
      <Button
        variant="outline"
        size="icon"
        aria-label="Página anterior"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === PAGE_ELLIPSIS ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="flex h-9 w-9 items-center justify-center text-muted-foreground"
          >
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            aria-label={`Página ${p}`}
            aria-current={p === page ? "page" : undefined}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        aria-label="Próxima página"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

/** `sm` do Tailwind (640px). Em callback/efeito, não durante o render do SSR. */
function useNarrowViewport(): boolean {
  const [narrow, setNarrow] = React.useState(false);
  React.useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return narrow;
}
