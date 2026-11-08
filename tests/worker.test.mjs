/**
 * Testes de integração do Worker gerado pelo build (`dist/server/index.js`).
 * Rode `npm run build` antes (o `npm test` já faz isso).
 *
 * Aqui não há banco de dados: o site público precisa continuar no ar mesmo
 * assim (mostra o conteúdo padrão), e o painel precisa exigir login.
 */
import assert from "node:assert/strict";
import test from "node:test";

const workerUrl = new URL("../dist/server/index.js", import.meta.url);
workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
const { default: worker } = await import(workerUrl.href);

const env = {
  ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
};
const ctx = { waitUntil() {}, passThroughOnException() {} };
const request = (path, init) =>
  worker.fetch(new Request(`http://localhost${path}`, init), env, ctx);

function assertSecurityHeaders(response) {
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.equal(
    response.headers.get("referrer-policy"),
    "strict-origin-when-cross-origin",
  );
  assert.match(
    response.headers.get("content-security-policy") ?? "",
    /frame-ancestors 'none'/,
  );
}

test("o site público abre com o conteúdo padrão mesmo sem banco", async () => {
  const response = await request("/", { headers: { accept: "text/html" } });
  assert.equal(response.status, 200);
  assertSecurityHeaders(response);
  const html = await response.text();
  assert.match(html, /lang="pt-BR"/);
  assert.match(html, /em sua melhor/);
  assert.match(html, /wa\.me\/556281231427/);
  assert.match(html, /Micropigmentação labial/);
  assert.match(html, /og-image\.jpg/);
});

test("o painel em /admin mostra o login e não aparece no Google", async () => {
  const response = await request("/admin", {
    headers: { accept: "text/html" },
  });
  assert.equal(response.status, 200);
  assertSecurityHeaders(response);
  const html = await response.text();
  assert.match(html, /Acesso administrativo/);
  assert.match(html, /noindex/);
});

test("a API do painel exige login de administradora", async () => {
  for (const path of [
    "/api/clients",
    "/api/dashboard",
    "/api/transactions",
    "/api/services",
    "/api/site",
    "/api/settings",
  ]) {
    const response = await request(path);
    assert.equal(response.status, 401, path);
    assert.match((await response.json()).error, /sessão/i);
  }
});

test("escritas vindas de outro site são bloqueadas", async () => {
  for (const [path, method] of [
    ["/api/clients", "POST"],
    ["/api/site", "PUT"],
    ["/api/gallery", "POST"],
  ]) {
    const response = await request(path, {
      method,
      headers: {
        origin: "https://site-malicioso.example",
        "content-type": "application/json",
      },
      body: JSON.stringify({}),
    });
    assert.equal(response.status, 403, path);
  }
});

test("login valida os dados antes de consultar o banco", async () => {
  const response = await request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "invalido", password: "" }),
  });
  assert.equal(response.status, 400);
});

test("as rotas de equipe da barbearia não existem neste projeto", async () => {
  const response = await request("/api/collaborators");
  assert.equal(response.status, 404);
});

test("só imagens enviadas pelo sistema podem ser lidas", async () => {
  const response = await request("/api/upload?key=../segredo.txt");
  assert.equal(response.status, 400);
});

test("a página de verificação do login foi removida", async () => {
  const response = await request("/api/auth/check");
  assert.equal(response.status, 404);
});

test("a página do curso não existe enquanto não for publicada", async () => {
  const response = await request("/curso", {
    headers: { accept: "text/html" },
  });
  assert.equal(response.status, 404);
  const home = await (
    await request("/", { headers: { accept: "text/html" } })
  ).text();
  assert.doesNotMatch(home, /href="\/curso"/);
});
