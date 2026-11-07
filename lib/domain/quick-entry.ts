/**
 * Lançamento rápido do caixa: em que ordem os procedimentos aparecem.
 *
 * Segue a mesma ordem definida em Procedimentos ("Ordem no site"); em caso
 * de empate, a ordem alfabética.
 */
export function sortForQuickEntry<
  T extends { name: string; sortOrder?: number },
>(services: T[]) {
  return [...services].sort(
    (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) ||
      a.name.localeCompare(b.name, "pt-BR"),
  );
}
