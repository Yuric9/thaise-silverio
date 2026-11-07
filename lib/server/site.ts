/**
 * Conteúdo do site público guardado no banco: textos, contatos, galeria e
 * procedimentos. Se o banco estiver vazio, cria os itens padrão; se estiver
 * indisponível, o site mostra o conteúdo padrão (nunca fica fora do ar).
 */
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, type Database } from "../../db";
import { galleryItems, services, siteContent } from "../../db/schema";
import { DEFAULT_SERVICES } from "../domain/catalog";
import {
  DEFAULT_GALLERY,
  DEFAULT_SITE_CONTENT,
  SITE_CONTENT_KEYS,
  type GalleryItem,
  type SiteContent,
  type SiteContentKey,
  type SiteService,
} from "../site-content";

// ─── Validação do que o painel envia ─────────────────────────────────────────

const shortText = (label: string, max = 200) =>
  z
    .string({ error: `Informe ${label}.` })
    .trim()
    .min(1, `Informe ${label}.`)
    .max(max, `${label} muito longo.`);

export const contactSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .regex(
      /^55\d{10,11}$/,
      "WhatsApp: use só números, começando com 55 e o DDD (ex.: 5562981231427).",
    ),
  whatsappDisplay: shortText("o número como aparece no site", 40),
  instagramHandle: z
    .string()
    .trim()
    .transform((value) => value.replace(/^@/, ""))
    .pipe(
      z
        .string()
        .regex(
          /^[A-Za-z0-9._]{1,30}$/,
          "Instagram: use só o nome do perfil, sem espaços.",
        ),
    ),
});

export const highlightsSchema = z
  .array(
    z.object({
      value: shortText("o destaque", 30),
      label: shortText("a descrição do destaque", 80),
    }),
  )
  .min(1, "Mantenha pelo menos um destaque.")
  .max(6, "Use no máximo 6 destaques.");

export const textsSchema = z.object({
  heroText: shortText("o texto do topo", 300),
  aboutHeading: shortText("o título do Sobre", 160),
  bio: z
    .array(shortText("o parágrafo da biografia", 900))
    .min(1, "Escreva pelo menos um parágrafo.")
    .max(6),
  signature: shortText("a assinatura", 60),
  servicesIntro: shortText("o texto dos procedimentos", 300),
  resultsIntro: shortText("o texto dos resultados", 300),
  coursesText: shortText("o texto dos cursos", 400),
  contactText: shortText("o texto do contato", 300),
});

export const contentSchemas = {
  contact: contactSchema,
  highlights: highlightsSchema,
  texts: textsSchema,
} as const;

// ─── Leitura ─────────────────────────────────────────────────────────────────

/** Cria procedimentos e galeria padrão quando o banco ainda está vazio. */
export async function ensureSiteSeed(db: Database) {
  const [anyService] = await db
    .select({ id: services.id })
    .from(services)
    .limit(1);
  if (!anyService) await db.insert(services).values(DEFAULT_SERVICES);
  const [anyPhoto] = await db
    .select({ id: galleryItems.id })
    .from(galleryItems)
    .limit(1);
  if (!anyPhoto) {
    const now = new Date().toISOString();
    await db
      .insert(galleryItems)
      .values(
        DEFAULT_GALLERY.map((item, index) => ({
          ...item,
          sortOrder: index + 1,
          createdAt: now,
        })),
      );
  }
}

export async function readSiteContent(db: Database): Promise<SiteContent> {
  const rows = await db.select().from(siteContent);
  const content: SiteContent = structuredClone(DEFAULT_SITE_CONTENT);
  for (const row of rows) {
    const key = row.key as SiteContentKey;
    if (!SITE_CONTENT_KEYS.includes(key)) continue;
    try {
      const parsed = contentSchemas[key].safeParse(JSON.parse(row.value));
      // Um valor salvo que não passa na validação é ignorado (fica o padrão).
      if (parsed.success)
        (content as Record<SiteContentKey, unknown>)[key] = parsed.data;
    } catch {
      // JSON inválido: mantém o padrão.
    }
  }
  return content;
}

export async function saveSiteContent(
  db: Database,
  key: SiteContentKey,
  value: unknown,
) {
  const data = contentSchemas[key].parse(value);
  const now = new Date().toISOString();
  const json = JSON.stringify(data);
  await db
    .insert(siteContent)
    .values({ key, value: json, updatedAt: now })
    .onConflictDoUpdate({
      target: siteContent.key,
      set: { value: json, updatedAt: now },
    });
  return data;
}

export async function listGallery(
  db: Database,
  onlyActive: boolean,
): Promise<GalleryItem[]> {
  const rows = await db
    .select()
    .from(galleryItems)
    .orderBy(asc(galleryItems.sortOrder), asc(galleryItems.id));
  return onlyActive ? rows.filter((row) => row.active) : rows;
}

export type PublicSite = {
  content: SiteContent;
  services: SiteService[];
  gallery: GalleryItem[];
};

function defaultPublicSite(): PublicSite {
  return {
    content: DEFAULT_SITE_CONTENT,
    services: DEFAULT_SERVICES.map((service, index) => ({
      id: index + 1,
      ...service,
    })),
    gallery: DEFAULT_GALLERY.map((item, index) => ({
      id: index + 1,
      sortOrder: index + 1,
      active: true,
      ...item,
    })),
  };
}

/** Tudo o que a página pública precisa, em uma chamada. */
export async function getPublicSite(): Promise<PublicSite> {
  try {
    const db = getDb();
    await ensureSiteSeed(db);
    const [content, serviceRows, gallery] = await Promise.all([
      readSiteContent(db),
      db
        .select({
          id: services.id,
          name: services.name,
          description: services.description,
          tag: services.tag,
        })
        .from(services)
        .where(eq(services.showOnSite, true))
        .orderBy(asc(services.sortOrder), asc(services.id)),
      listGallery(db, true),
    ]);
    return { content, services: serviceRows, gallery };
  } catch (error) {
    // Banco indisponível: o site continua no ar com o conteúdo padrão.
    console.error("public-site-fallback", error);
    return defaultPublicSite();
  }
}
