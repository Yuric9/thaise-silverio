/**
 * Configuração injetada pelo Worker (ver `worker/index.ts`) a partir das
 * variáveis e segredos da Cloudflare. Nunca grave senhas no código.
 */
type StudioRuntime = typeof globalThis & {
  __TS_ADMIN_EMAIL?: string;
  __TS_ADMIN_PASSWORD_HASH?: string;
};

export function adminRuntimeConfig() {
  const runtime = globalThis as StudioRuntime;
  return {
    email: (runtime.__TS_ADMIN_EMAIL || "").trim().toLowerCase(),
    passwordHash: runtime.__TS_ADMIN_PASSWORD_HASH || "",
  };
}
