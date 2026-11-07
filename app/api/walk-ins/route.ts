import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../../../db";
import { appointments, services, transactions } from "../../../db/schema";
import { PAYMENT_METHODS } from "../../../lib/domain/catalog";
import { nowTime, todayKey } from "../../../lib/domain/dates";
import { adminRoute, ApiError, ok, readBody } from "../../../lib/server/http";
import { optionalText, positiveId } from "../../../lib/server/validation";

export const dynamic = "force-dynamic";

const walkIn = z.object({
  serviceId: positiveId,
  clientName: z.string().trim().max(120).optional().default(""),
  paymentMethod: z.enum(PAYMENT_METHODS),
  note: optionalText(240),
});

/**
 * Atendimento avulso (cliente sem agendamento): registra o atendimento já
 * finalizado e lança a entrada no caixa.
 */
export const POST = adminRoute(async ({ request }) => {
  const input = await readBody(request, walkIn);
  const db = getDb();
  const [service] = await db
    .select()
    .from(services)
    .where(and(eq(services.id, input.serviceId), eq(services.active, true)))
    .limit(1);
  if (!service) throw new ApiError(400, "Procedimento inválido ou inativo.");

  const clientName = input.clientName || "Cliente avulsa";
  const date = todayKey();
  const createdAt = new Date().toISOString();

  const [appointment] = await db
    .insert(appointments)
    .values({
      clientEmail: `avulso-${crypto.randomUUID()}@cadastro.local`,
      clientName,
      serviceId: service.id,
      serviceName: service.name,
      serviceIds: String(service.id),
      date,
      time: nowTime(),
      durationMin: service.durationMin,
      status: "Finalizado",
      adminMessage: ["Atendimento avulso, sem agendamento", input.note]
        .filter(Boolean)
        .join(" · "),
      totalCents: service.priceCents,
      paymentMethod: input.paymentMethod,
      createdAt,
    })
    .returning();

  const [entry] = await db
    .insert(transactions)
    .values({
      kind: "entrada",
      description: `${service.name} (avulso) — ${clientName}`,
      amountCents: service.priceCents,
      date,
      appointmentId: appointment.id,
      clientName,
      serviceId: service.id,
      serviceName: service.name,
      paymentMethod: input.paymentMethod,
      createdAt,
    })
    .returning();
  await db
    .update(appointments)
    .set({ cashTransactionId: entry.id })
    .where(eq(appointments.id, appointment.id));

  return ok({ appointment, transaction: entry }, 201);
});
