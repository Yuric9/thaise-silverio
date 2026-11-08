import { adminRuntimeConfig } from "../../../../lib/server/runtime-config";

export const dynamic = "force-dynamic";

/**
 * Verificação da configuração do login, para quando a senha certa é recusada.
 * Responde só "sim/não" sobre os segredos — nunca mostra os valores.
 */
export async function GET() {
  const { email, passwordHash } = adminRuntimeConfig();
  const parts = passwordHash.split("$");
  const hashFormatOk =
    parts.length === 4 &&
    parts[0] === "pbkdf2-sha256" &&
    parts[1] === "100000" &&
    /^[A-Za-z0-9_-]{22}$/.test(parts[2]) &&
    /^[A-Za-z0-9_-]{43}$/.test(parts[3]);
  return Response.json(
    {
      emailConfigurado: Boolean(email),
      emailPareceValido: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      senhaConfigurada: Boolean(passwordHash),
      formatoDaSenhaCorreto: hashFormatOk,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
