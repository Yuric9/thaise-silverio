import { max } from "drizzle-orm";
import { getDb } from "../../../db";
import { galleryItems } from "../../../db/schema";
import { galleryFields } from "../../../lib/server/gallery";
import { adminRoute, ok, readBody } from "../../../lib/server/http";

export const dynamic = "force-dynamic";

/** Adiciona uma foto à galeria (a imagem já foi enviada para o R2). */
export const POST = adminRoute(async ({ request }) => {
  const input = await readBody(
    request,
    galleryFields.partial({ sortOrder: true, active: true }),
  );
  const db = getDb();
  const [{ last }] = await db
    .select({ last: max(galleryItems.sortOrder) })
    .from(galleryItems);
  const [created] = await db
    .insert(galleryItems)
    .values({
      ...input,
      sortOrder: input.sortOrder ?? (last ?? 0) + 1,
      active: input.active ?? true,
      createdAt: new Date().toISOString(),
    })
    .returning();
  return ok({ item: created }, 201);
});
