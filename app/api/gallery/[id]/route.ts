import { eq } from "drizzle-orm";
import { getDb } from "../../../../db";
import { galleryItems } from "../../../../db/schema";
import { galleryFields } from "../../../../lib/server/gallery";
import {
  adminRoute,
  idParam,
  notFound,
  ok,
  readBody,
} from "../../../../lib/server/http";

export const dynamic = "force-dynamic";

export const PATCH = adminRoute<{ id: string }>(async ({ request, params }) => {
  const id = idParam(params.id);
  const input = await readBody(
    request,
    galleryFields.omit({ imageKey: true, width: true, height: true }).partial(),
  );
  const [updated] = await getDb()
    .update(galleryItems)
    .set(input)
    .where(eq(galleryItems.id, id))
    .returning();
  if (!updated) throw notFound("Foto");
  return ok({ item: updated });
});

/** Remove a foto do site e apaga o arquivo do R2 (fotos enviadas pelo painel). */
export const DELETE = adminRoute<{ id: string }>(async ({ params }) => {
  const id = idParam(params.id);
  const db = getDb();
  const [removed] = await db
    .delete(galleryItems)
    .where(eq(galleryItems.id, id))
    .returning();
  if (!removed) throw notFound("Foto");
  if (removed.imageKey.startsWith("gallery/")) {
    const bucket = (
      globalThis as typeof globalThis & { __TS_BUCKET?: R2Bucket }
    ).__TS_BUCKET;
    await bucket?.delete(removed.imageKey);
  }
  return ok({ ok: true });
});
