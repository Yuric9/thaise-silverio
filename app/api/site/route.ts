import { z } from "zod";
import { getDb } from "../../../db";
import { adminRoute, ok, readBody } from "../../../lib/server/http";
import {
  ensureSiteSeed,
  listGallery,
  readSiteContent,
  saveSiteContent,
} from "../../../lib/server/site";
import { SITE_CONTENT_KEYS } from "../../../lib/site-content";

export const dynamic = "force-dynamic";

/** Conteúdo do site e galeria, para a tela "Site" do painel. */
export const GET = adminRoute(async () => {
  const db = getDb();
  await ensureSiteSeed(db);
  const [content, gallery] = await Promise.all([
    readSiteContent(db),
    listGallery(db, false),
  ]);
  return ok({ content, gallery });
});

const update = z.object({ key: z.enum(SITE_CONTENT_KEYS), value: z.unknown() });

/** Salva uma parte do conteúdo (contatos, destaques ou textos). */
export const PUT = adminRoute(async ({ request }) => {
  const { key, value } = await readBody(request, update);
  const saved = await saveSiteContent(getDb(), key, value);
  return ok({ key, value: saved });
});
