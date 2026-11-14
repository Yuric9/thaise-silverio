import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../../../../db";
import { courseLeads } from "../../../../db/schema";
import {
  adminRoute,
  idParam,
  ApiError,
  ok,
  readBody,
} from "../../../../lib/server/http";

export const dynamic = "force-dynamic";

const change = z.object({ status: z.enum(["Nova", "Contatada"]) });

/** Marca a interessada como contatada (ou volta para nova). */
export const PATCH = adminRoute<{ id: string }>(async ({ request, params }) => {
  const id = idParam(params.id);
  const { status } = await readBody(request, change);
  const [updated] = await getDb()
    .update(courseLeads)
    .set({
      status,
      contactedAt: status === "Contatada" ? new Date().toISOString() : "",
    })
    .where(eq(courseLeads.id, id))
    .returning();
  if (!updated) throw new ApiError(404, "Interessada não encontrada.");
  return ok({ lead: updated });
});

/** Apaga a interessada da lista (por exemplo, a pedido dela). */
export const DELETE = adminRoute<{ id: string }>(async ({ params }) => {
  const id = idParam(params.id);
  const [removed] = await getDb()
    .delete(courseLeads)
    .where(eq(courseLeads.id, id))
    .returning();
  if (!removed) throw new ApiError(404, "Interessada não encontrada.");
  return ok({ ok: true });
});
