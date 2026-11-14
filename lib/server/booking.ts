/**
 * Agendamento pelo site (/agendar): a cliente pede um horário livre e o pedido
 * entra na agenda como "Pendente", marcado como vindo do site. A Thaise
 * confirma ou cancela no painel (cancelar libera o horário).
 *
 * Cuidados de um formulário público:
 * - só procedimentos ativos, visíveis no site e com "aceita agendamento";
 * - só datas de hoje até `maxDaysAhead` dias à frente;
 * - limite de pedidos por IP e por WhatsApp;
 * - cliente já cadastrada nunca é alterada (o nome digitado vai na observação).
 */
import { and, asc, eq, gte } from "drizzle-orm";
import { z } from "zod";
import type { Database } from "../../db";
import { appointments, profiles, services } from "../../db/schema";
import { addDays, todayKey } from "../domain/dates";
import {
  clientEmailForPhone,
  formatPhone,
  isValidPhone,
  phoneDigits,
} from "../domain/phone";
import { availableTimes, createAppointment } from "./appointments";
import { ApiError } from "./http";
import { readSiteContent } from "./site";
import { dateKey, time } from "./validation";

/** Pedidos do site ainda pendentes que um mesmo WhatsApp pode ter. */
export const MAX_OPEN_REQUESTS_PER_PHONE = 2;

export async function bookingSettings(db: Database) {
  const { booking } = await readSiteContent(db);
  if (!booking.enabled)
    throw new ApiError(404, "O agendamento pelo site está desligado.");
  return booking;
}

/** Procedimentos que a cliente pode escolher no site. */
export async function bookableServices(db: Database) {
  return db
    .select({
      id: services.id,
      name: services.name,
      durationMin: services.durationMin,
      priceCents: services.priceCents,
      description: services.description,
    })
    .from(services)
    .where(
      and(
        eq(services.active, true),
        eq(services.showOnSite, true),
        eq(services.onlineBooking, true),
      ),
    )
    .orderBy(asc(services.sortOrder), asc(services.id));
}

async function checkRequest(
  db: Database,
  input: { serviceId: number; date: string },
) {
  const booking = await bookingSettings(db);
  const today = todayKey();
  const last = addDays(today, booking.maxDaysAhead);
  if (input.date < today || input.date > last)
    throw new ApiError(
      400,
      `Escolha uma data entre hoje e os próximos ${booking.maxDaysAhead} dias.`,
    );
  const allowed = await bookableServices(db);
  if (!allowed.some((service) => service.id === input.serviceId))
    throw new ApiError(
      400,
      "Este procedimento não pode ser agendado pelo site.",
    );
}

export const availabilityQuery = z.object({
  date: dateKey,
  serviceId: z.coerce.number().int().positive("Escolha o procedimento."),
});

/** Horários livres para um procedimento num dia (só horários, nada da agenda). */
export async function siteAvailability(
  db: Database,
  input: z.infer<typeof availabilityQuery>,
) {
  await checkRequest(db, input);
  const { times } = await availableTimes(db, {
    date: input.date,
    serviceIds: [input.serviceId],
  });
  return { times };
}

export const bookingRequestSchema = z.object({
  serviceId: z.coerce.number().int().positive("Escolha o procedimento."),
  date: dateKey,
  time,
  name: z
    .string({ error: "Informe o seu nome." })
    .trim()
    .min(2, "Informe o seu nome.")
    .max(80, "Nome muito longo."),
  phone: z
    .string({ error: "Informe o seu WhatsApp." })
    .trim()
    .max(30)
    .refine(isValidPhone, "Informe um WhatsApp válido com DDD."),
  note: z.string().trim().max(240, "Observação muito longa.").default(""),
  consent: z.literal(true, {
    error: "Marque a autorização para a Thaise entrar em contato.",
  }),
  /** Armadilha para robôs (campo escondido). */
  website: z.string().max(200).default(""),
});

export async function requestBooking(
  db: Database,
  input: z.infer<typeof bookingRequestSchema>,
) {
  await checkRequest(db, input);

  // Cliente já cadastrada (pelo WhatsApp) não é alterada por um formulário público.
  const digits = phoneDigits(input.phone);
  const existing = (await db.select().from(profiles)).find(
    (profile) => phoneDigits(profile.phone) === digits,
  );
  const clientEmail = existing?.email ?? clientEmailForPhone(input.phone);

  const open = await db
    .select({ id: appointments.id })
    .from(appointments)
    .where(
      and(
        eq(appointments.clientEmail, clientEmail),
        eq(appointments.source, "site"),
        eq(appointments.status, "Pendente"),
        gte(appointments.date, todayKey()),
      ),
    );
  if (open.length >= MAX_OPEN_REQUESTS_PER_PHONE)
    throw new ApiError(
      429,
      "Você já tem pedidos aguardando a confirmação da Thaise. Fale com ela pelo WhatsApp.",
    );

  const note = [
    "Pedido pelo site",
    existing && existing.name !== input.name
      ? `nome informado: ${input.name}`
      : "",
    `WhatsApp: ${formatPhone(input.phone)}`,
    input.note ? `obs.: ${input.note}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  // Reserva o horário primeiro; só então cadastra a cliente nova (se o horário
  // acabou de ser ocupado, nada fica sobrando no cadastro).
  const appointment = await createAppointment(db, {
    client: { email: clientEmail, name: existing?.name ?? input.name },
    serviceIds: [input.serviceId],
    date: input.date,
    time: input.time,
    note,
    source: "site",
  });
  if (!existing)
    await db
      .insert(profiles)
      .values({
        email: clientEmail,
        name: input.name,
        phone: input.phone,
        createdAt: new Date().toISOString(),
      })
      .onConflictDoNothing();
  return appointment;
}
