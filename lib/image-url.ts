/**
 * Endereço de uma imagem: as fotos que já vinham com o site ficam em
 * `public/` (começam com "/"); as enviadas pelo painel ficam no R2.
 */
export function imageUrl(key: string) {
  if (!key) return "";
  return key.startsWith("/")
    ? key
    : `/api/upload?key=${encodeURIComponent(key)}`;
}
