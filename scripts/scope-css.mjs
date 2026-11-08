// Isola um arquivo CSS dentro de uma classe (ex.: .site-scope), para que o CSS
// do site e o do painel não se misturem quando o build junta os dois.
//
// Uso: node scripts/scope-css.mjs <arquivo.css> <.classe>
// O script é idempotente: regras que já começam com a classe ficam iguais.
import { readFile, writeFile } from "node:fs/promises";
import postcss from "postcss";

const [file, scope] = process.argv.slice(2);
if (!file || !scope?.startsWith(".")) {
  console.error("Uso: node scripts/scope-css.mjs <arquivo.css> <.classe>");
  process.exit(64);
}

function scopeSelector(selector) {
  const trimmed = selector.trim();
  // Já isolada (rodar o script de novo não muda nada).
  if (trimmed.startsWith(scope) || trimmed.includes(`:has(${scope})`))
    return trimmed;
  // As variáveis de cor ficam na página inteira (para o <body> também vê-las),
  // mas só quando a área correspondente estiver nela.
  if (trimmed === ":root") return `:root:has(${scope})`;
  if (
    trimmed === "html" ||
    trimmed.startsWith("html ") ||
    trimmed.startsWith("html:")
  ) {
    return trimmed.replace(/^html/, `html:has(${scope})`);
  }
  if (
    trimmed === "body" ||
    trimmed.startsWith("body ") ||
    trimmed.startsWith("body:")
  ) {
    return trimmed.replace(/^body/, `body:has(${scope})`);
  }
  return `${scope} ${trimmed}`;
}

const css = await readFile(file, "utf8");
const root = postcss.parse(css, { from: file });
root.walkRules((rule) => {
  // Passos de animação (@keyframes) não são seletores.
  if (rule.parent?.type === "atrule" && /keyframes$/i.test(rule.parent.name))
    return;
  rule.selectors = rule.selectors.map(scopeSelector);
});
await writeFile(file, root.toResult().css);
console.log(`${file}: regras isoladas em ${scope}`);
