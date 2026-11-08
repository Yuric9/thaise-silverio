import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const files = [
  ["app/(site)/site.css", ".site-scope"],
  ["app/admin/admin.css", ".admin-scope"],
];

test("CSS isolado: as cores ficam em :root:has(...), sem prefixo duplicado", () => {
  for (const [file, scope] of files) {
    const css = readFileSync(file, "utf8");
    assert.ok(css.includes(`:root:has(${scope})`), `${file} sem as variáveis`);
    assert.ok(!css.includes(`${scope} :root`), `${file} com :root quebrado`);
    assert.ok(
      !css.includes(`:has(${scope}):has(${scope})`),
      `${file} com prefixo duplicado`,
    );
  }
});

test("CSS isolado: rodar o script de novo não muda o arquivo", () => {
  const dir = mkdtempSync(join(tmpdir(), "scope-"));
  for (const [file, scope] of files) {
    const copy = join(dir, "arquivo.css");
    copyFileSync(file, copy);
    const before = readFileSync(copy, "utf8");
    execFileSync("node", ["scripts/scope-css.mjs", copy, scope]);
    const normalize = (css) => css.replace(/\s+/g, " ").trim();
    assert.equal(normalize(readFileSync(copy, "utf8")), normalize(before));
  }
});
