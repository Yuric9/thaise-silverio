/**
 * Configuração injetada pelo Worker (ver `worker/index.ts`) a partir das
 * variáveis e segredos da Cloudflare. Nunca grave senhas no código.
 */
type StudioRuntime = typeof globalThis & {
  __TS_ADMIN_EMAIL?: string;
  __TS_ADMIN_PASSWORD_HASH?: string;
};

/**
 * Limpa o que costuma vir junto ao colar um segredo no painel da Cloudflare:
 * espaços, quebras de linha e aspas no começo ou no fim.
 */
export function cleanSecret(value: string | undefined) {
  return (value || "")
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .trim();
}

export function adminRuntimeConfig() {
  const runtime = globalThis as StudioRuntime;
  return {
    email: cleanSecret(runtime.__TS_ADMIN_EMAIL).toLowerCase(),
    passwordHash: cleanSecret(runtime.__TS_ADMIN_PASSWORD_HASH).replace(
      /\s+/g,
      "",
    ),
  };
}
