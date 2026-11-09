/**
 * Limite de tentativas de login (dois limites ao mesmo tempo):
 * - por IP + e-mail: após 8 erros em 15 minutos, bloqueia por 15 minutos;
 * - só por e-mail, de qualquer lugar: após 30 erros em 15 minutos, bloqueia
 *   aquele e-mail por 15 minutos (quem troca de IP não ganha tentativas novas).
 */
import { eq, inArray } from "drizzle-orm";
import { getDb } from "../../db";
import { authAttempts } from "../../db/schema";

const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const MAX_FAILURES = 8;
const MAX_FAILURES_PER_EMAIL = 30;

async function attemptKey(
  request: Request | null,
  scope: string,
  identity: string,
) {
  // Sem `request`, a chave vale para o e-mail vindo de qualquer IP.
  const ip = request
    ? request.headers.get("cf-connecting-ip") || "unknown"
    : "*";
  const raw = `${scope}|${ip}|${identity.trim().toLowerCase()}`;
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

async function incrementAttempt(key: string, maxAttempts: number) {
  const db = getDb();
  const [row] = await db
    .select()
    .from(authAttempts)
    .where(eq(authAttempts.key, key))
    .limit(1);
  const now = Date.now();
  if (row?.blockedUntil && Date.parse(row.blockedUntil) > now) return true;

  const windowStart = row ? Date.parse(row.windowStart) : 0;
  const withinWindow =
    Number.isFinite(windowStart) && now - windowStart < WINDOW_MS;
  const nextCount = withinWindow ? row.count + 1 : 1;
  const nextWindow = withinWindow
    ? row.windowStart
    : new Date(now).toISOString();
  const blockedUntil =
    nextCount >= maxAttempts ? new Date(now + BLOCK_MS).toISOString() : "";

  await db
    .insert(authAttempts)
    .values({
      key,
      count: nextCount,
      windowStart: nextWindow,
      blockedUntil,
    })
    .onConflictDoUpdate({
      target: authAttempts.key,
      set: { count: nextCount, windowStart: nextWindow, blockedUntil },
    });
  return false;
}

async function isBlocked(key: string) {
  const [row] = await getDb()
    .select()
    .from(authAttempts)
    .where(eq(authAttempts.key, key))
    .limit(1);
  return Boolean(
    row?.blockedUntil && Date.parse(row.blockedUntil) > Date.now(),
  );
}

export type LoginLimit = { key: string; emailKey: string; blocked: boolean };

export async function checkLoginLimit(
  request: Request,
  identity: string,
): Promise<LoginLimit> {
  const key = await attemptKey(request, "login", identity);
  const emailKey = await attemptKey(null, "login-email", identity);
  const [byIp, byEmail] = await Promise.all([
    isBlocked(key),
    isBlocked(emailKey),
  ]);
  return { key, emailKey, blocked: byIp || byEmail };
}

export async function recordLoginFailure(limit: LoginLimit) {
  await incrementAttempt(limit.key, MAX_FAILURES);
  await incrementAttempt(limit.emailKey, MAX_FAILURES_PER_EMAIL);
}

export async function clearLoginFailures(limit: LoginLimit) {
  await getDb()
    .delete(authAttempts)
    .where(inArray(authAttempts.key, [limit.key, limit.emailKey]));
}
