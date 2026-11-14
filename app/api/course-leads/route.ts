import { desc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { courseLeads } from "../../../db/schema";
import { phoneDigits } from "../../../lib/domain/phone";
import { courseLeadSchema } from "../../../lib/server/course";
import {
  adminRoute,
  ApiError,
  ok,
  publicRoute,
  readBody,
} from "../../../lib/server/http";
import { publicFormLimit } from "../../../lib/server/rate-limit";
import { readSiteContent } from "../../../lib/server/site";

export const dynamic = "force-dynamic";

/** Lista de interessadas (painel). */
export const GET = adminRoute(async () => {
  const leads = await getDb()
    .select()
    .from(courseLeads)
    .orderBy(desc(courseLeads.createdAt));
  return ok({ leads });
});

/** Formulário público "Quero ser avisada" da página do curso. */
export const POST = publicRoute(async (request) => {
  const input = await readBody(request, courseLeadSchema);
  // Robô preencheu o campo escondido: finge que deu certo e não guarda nada.
  if (input.website) return ok({ ok: true }, 201);

  const db = getDb();
  const { course } = await readSiteContent(db);
  if (!course.published) throw new ApiError(404, "Curso indisponível.");

  const limit = await publicFormLimit(request, "course-lead", 5);
  if (limit.blocked)
    throw new ApiError(
      429,
      "Recebemos vários envios seguidos. Tente de novo mais tarde ou chame a Thaise no WhatsApp.",
    );

  // Mesmo WhatsApp já na lista: atualiza em vez de repetir.
  const digits = phoneDigits(input.phone);
  const existing = (await db.select().from(courseLeads)).find(
    (lead) => phoneDigits(lead.phone) === digits,
  );
  const now = new Date().toISOString();
  const values = {
    name: input.name,
    phone: input.phone,
    city: input.city,
    message: input.message,
  };
  if (existing) {
    await db
      .update(courseLeads)
      .set({ ...values, status: "Nova", createdAt: now })
      .where(eq(courseLeads.id, existing.id));
  } else {
    await db.insert(courseLeads).values({ ...values, createdAt: now });
  }
  return ok({ ok: true }, 201);
});
