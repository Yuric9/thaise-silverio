import { asc } from "drizzle-orm";
import { getDb } from "../../../db";
import { services } from "../../../db/schema";
import { adminRoute, ok, readBody } from "../../../lib/server/http";
import { ensureSiteSeed } from "../../../lib/server/site";
import { serviceFields } from "../../../lib/server/validation";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async () => {
  const db = getDb();
  // Primeiro acesso: cria os procedimentos que já estavam no site.
  await ensureSiteSeed(db);
  const rows = await db
    .select()
    .from(services)
    .orderBy(asc(services.sortOrder), asc(services.id));
  return ok({ services: rows });
});

export const POST = adminRoute(async ({ request }) => {
  const { price, ...input } = await readBody(
    request,
    serviceFields.partial({
      active: true,
      description: true,
      tag: true,
      showOnSite: true,
      sortOrder: true,
      touchUpDays: true,
    }),
  );
  const [created] = await getDb()
    .insert(services)
    .values({ ...input, priceCents: price, active: input.active ?? true })
    .returning();
  return ok({ service: created }, 201);
});
