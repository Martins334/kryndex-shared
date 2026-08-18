export const PAGE_ELLIPSIS = "…" as const;

/**
 * Páginas a exibir numa barra de paginação: `1 … 31 32 [33] 34 35 … 66`.
 * A primeira e a última estão SEMPRE presentes; o meio é uma janela em volta da atual,
 * com `siblings` páginas de cada lado.
 *
 * Quando a lacuna é de UMA página só, devolve o número em vez de "…" — o reticências
 * ocuparia o mesmo espaço do número que estaria escondendo, sem ganho nenhum.
 *
 * Fica fora de `components/ui/pagination.tsx` porque é função pura: exportá-la de um
 * arquivo de componentes dispara o `react-refresh/only-export-components`.
 */
export function pageRange(
  page: number,
  pageCount: number,
  siblings: number,
): (number | typeof PAGE_ELLIPSIS)[] {
  const first = 1;
  const last = pageCount;
  const start = Math.max(first + 1, page - siblings);
  const end = Math.min(last - 1, page + siblings);

  const out: (number | typeof PAGE_ELLIPSIS)[] = [first];

  if (start === first + 2) out.push(first + 1);
  else if (start > first + 1) out.push(PAGE_ELLIPSIS);

  for (let p = start; p <= end; p++) out.push(p);

  if (end === last - 2) out.push(last - 1);
  else if (end < last - 1) out.push(PAGE_ELLIPSIS);

  if (last > first) out.push(last);
  return out;
}
