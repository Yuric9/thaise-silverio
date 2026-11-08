/** Contagem dos destaques do site ("+500", "6 anos", "+1.000"). */

export type Counter = {
  before: string;
  after: string;
  end: number;
  grouped: boolean;
};

/** Lê "+1.500", "6 anos"... e separa o que vem antes, o número e o resto. */
export function parseCounter(text: string): Counter | null {
  const match = text.match(/^(\D*?)(\d{1,3}(?:\.\d{3})+|\d+)(.*)$/s);
  if (!match) return null;
  const [, before, digits, after] = match;
  return {
    before,
    after,
    end: Number(digits.replace(/\./g, "")),
    grouped: digits.includes("."),
  };
}

/** Texto do número durante a contagem ("1 ano", "+1.250"...). */
export function counterText(counter: Counter, value: number) {
  const number = counter.grouped
    ? value.toLocaleString("pt-BR")
    : String(value);
  const after =
    value === 1 && counter.end !== 1
      ? counter.after.replace(/s$/, "")
      : counter.after;
  return counter.before + number + after;
}
