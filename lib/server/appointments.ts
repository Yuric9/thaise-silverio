/**
 * Regras de agendamento que dependem do banco: disponibilidade, criação com
 * reserva de horário e mudança de status (com lançamento no caixa).
 */
import { and, eq, exists, inArray, max, ne, sql } from "drizzle-orm";
import type { SQLiteUpdateSetSource } from "drizzle-orm/sqlite-core";
import type { Database } from "../../db";
import {
  appointmentSlots,
  appointments,
  profiles,
  scheduleBlocks,
  services,
  transactions,
} from "../../db/schema";
import {
  COURTESY,
  canTransition,
  type AppointmentStatus,
} from "../domain/catalog";
import { nowMinutes, todayKey } from "../domain/dates";
import { loyaltySnapshot } from "../domain/loyalty";
import {
  isPastSlot,
  isSlotFree,
  slotsCovered,
  startTimesFor,
  STUDIO,
} from "../domain/schedule";
import { isPaidVisit } from "./clients";
import { insertWhen } from "./insert-when";
import { ApiError } from "./http";
import { getOpeningHours } from "./settings";

type AppointmentRow = typeof appointments.$inferSelect;

async function loadServices(db: Database, ids: number[]) {
  const unique = [...new Set(ids)].slice(0, 10);
  if (!unique.length) throw new ApiError(400, "Escolha pelo menos um serviço.");
  const rows = await db
    .select()
    .from(services)
    .where(and(inArray(services.id, unique), eq(services.active, true)));
  if (rows.length !== unique.length)
    throw new ApiError(400, "Um dos serviços escolhidos não está disponível.");
  // Mantém a ordem escolhida pelo usuário.
  return unique.map((id) => rows.find((row) => row.id === id)!);
}

async function dayReservations(db: Database, date: string) {
  const [locks, blocks] = await Promise.all([
    db.select().from(appointmentSlots).where(eq(appointmentSlots.date, date)),
    db.select().from(scheduleBlocks).where(eq(scheduleBlocks.date, date)),
  ]);
  return { locks, blocks };
}

/** Horários de início livres para os procedimentos escolhidos em uma data. */
export async function availableTimes(
  db: Database,
  input: { date: string; serviceIds: number[] },
) {
  const selected = await loadServices(db, input.serviceIds);
  const durationMin = selected.reduce(
    (sum, service) => sum + service.durationMin,
    0,
  );
  const [hours, { locks, blocks }] = await Promise.all([
    getOpeningHours(db),
    dayReservations(db, input.date),
  ]);
  const today = todayKey();
  const minutes = nowMinutes();
  const times = startTimesFor(input.date, durationMin, hours).filter(
    (time) =>
      !isPastSlot(input.date, time, today, minutes) &&
      isSlotFree({ time, durationMin, locks, blocks }),
  );
  return { durationMin, times };
}

export async function createAppointment(
  db: Database,
  input: {
    client: { email: string; name: string };
    serviceIds: number[];
    date: string;
    time: string;
    note: string;
  },
) {
  const selected = await loadServices(db, input.serviceIds);
  const durationMin = selected.reduce(
    (sum, service) => sum + service.durationMin,
    0,
  );
  const totalCents = selected.reduce(
    (sum, service) => sum + service.priceCents,
    0,
  );
  const hours = await getOpeningHours(db);

  if (!startTimesFor(input.date, durationMin, hours).includes(input.time)) {
    throw new ApiError(
      400,
      "Os procedimentos escolhidos não cabem neste horário (fora do horário de atendimento).",
    );
  }
  if (isPastSlot(input.date, input.time, todayKey(), nowMinutes())) {
    throw new ApiError(400, "Este horário já passou.");
  }

  const { locks, blocks } = await dayReservations(db, input.date);
  if (!isSlotFree({ time: input.time, durationMin, locks, blocks })) {
    throw new ApiError(409, "Este horário já está ocupado. Escolha outro.");
  }

  // Reserva as faixas de horário primeiro: o índice único do banco impede que
  // duas requisições simultâneas peguem o mesmo horário.
  const now = new Date().toISOString();
  const reservationId = crypto.randomUUID();
  try {
    await db.insert(appointmentSlots).values(
      slotsCovered(input.time, durationMin).map((time) => ({
        date: input.date,
        time,
        resourceKey: STUDIO,
        reservationId,
        createdAt: now,
      })),
    );
  } catch {
    throw new ApiError(
      409,
      "Este horário acabou de ser reservado. Escolha outro.",
    );
  }

  try {
    const details = selected
      .map((service) => `${service.name} (${service.durationMin} min)`)
      .join(", ");
    const [created] = await db
      .insert(appointments)
      .values({
        clientEmail: input.client.email,
        clientName: input.client.name,
        serviceId: selected[0].id,
        serviceName: selected.map((service) => service.name).join(" + "),
        serviceIds: selected.map((service) => service.id).join(","),
        date: input.date,
        time: input.time,
        durationMin,
        totalCents,
        adminMessage: [
          input.note,
          `Procedimentos: ${details} · ${durationMin} min`,
        ]
          .filter(Boolean)
          .join(" · "),
        createdAt: now,
      })
      .returning();
    await db
      .update(appointmentSlots)
      .set({ appointmentId: created.id })
      .where(eq(appointmentSlots.reservationId, reservationId));
    return created;
  } catch (error) {
    await db
      .delete(appointmentSlots)
      .where(eq(appointmentSlots.reservationId, reservationId));
    throw error;
  }
}

export async function getAppointment(db: Database, id: number) {
  const [appointment] = await db
    .select()
    .from(appointments)
    .where(eq(appointments.id, id))
    .limit(1);
  if (!appointment) throw new ApiError(404, "Agendamento não encontrado.");
  return appointment;
}

/**
 * Atualiza o status de um agendamento.
 * - Cancelado: libera o horário reservado.
 * - Finalizado: lança a entrada no caixa; com pagamento "Cortesia",
 *   consome um benefício do cartão fidelidade.
 */
export async function changeAppointmentStatus(
  db: Database,
  appointment: AppointmentRow,
  status: AppointmentStatus,
  paymentMethod: string,
  actorEmail: string,
) {
  if (!canTransition(appointment.status, status)) {
    throw new ApiError(
      409,
      `Um agendamento ${appointment.status.toLowerCase()} não pode mudar para ${status.toLowerCase()}.`,
    );
  }

  if (status === "Finalizado" && appointment.date > todayKey()) {
    throw new ApiError(
      409,
      "Só é possível finalizar atendimentos de hoje ou de dias anteriores.",
    );
  }

  // A condição `status = atual` evita processar duas vezes o mesmo clique.
  const stillPending = and(
    eq(appointments.id, appointment.id),
    eq(appointments.status, appointment.status),
  );
  const claim = (values: SQLiteUpdateSetSource<typeof appointments>) =>
    db
      .update(appointments)
      .set({ status, ...values })
      .where(stillPending)
      .returning({ id: appointments.id });

  if (status !== "Finalizado") {
    const updated = await claim({});
    if (!updated.length)
      throw new ApiError(
        409,
        "O agendamento foi alterado por outra pessoa. Atualize a página.",
      );
    if (status === "Cancelado")
      await db
        .delete(appointmentSlots)
        .where(eq(appointmentSlots.appointmentId, appointment.id));
    return;
  }

  const now = new Date().toISOString();
  // Tudo o que acontece ao finalizar vai em um único lote (`db.batch`): o D1
  // grava todos os comandos ou nenhum. Os comandos que vêm antes do `claim` só
  // agem se o agendamento ainda estiver no status de antes; assim, um clique
  // repetido não lança nada em dobro.

  if (paymentMethod === COURTESY) {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, appointment.clientEmail))
      .limit(1);
    const history = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.clientEmail, appointment.clientEmail),
          ne(appointments.id, appointment.id),
        ),
      );
    if (
      !profile ||
      !loyaltySnapshot(profile, history.filter(isPaidVisit).length)
        .rewardAvailable
    ) {
      throw new ApiError(
        409,
        "Este cliente ainda não possui atendimento gratuito disponível.",
      );
    }
    const [, updated] = await db.batch([
      db
        .update(profiles)
        .set({
          loyaltyRewardsRedeemed: sql`${profiles.loyaltyRewardsRedeemed} + 1`,
          loyaltyUpdatedAt: now,
          loyaltyUpdatedBy: actorEmail,
        })
        .where(
          and(
            eq(profiles.email, appointment.clientEmail),
            exists(
              db
                .select({ id: appointments.id })
                .from(appointments)
                .where(stillPending),
            ),
          ),
        ),
      claim({ paymentMethod, cashTransactionId: null }),
    ]);
    if (!updated.length)
      throw new ApiError(
        409,
        "O agendamento foi alterado por outra pessoa. Atualize a página.",
      );
    return;
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, appointment.clientEmail))
    .limit(1);

  const [, updated] = await db.batch([
    insertWhen(
      db,
      transactions,
      {
        kind: "entrada",
        description: `${appointment.serviceName} — ${appointment.clientName}`,
        amountCents: appointment.totalCents,
        date: appointment.date,
        appointmentId: appointment.id,
        clientEmail: profile?.email ?? "",
        clientName: appointment.clientName,
        serviceId: appointment.serviceId,
        serviceName: appointment.serviceName,
        paymentMethod,
        createdAt: now,
      },
      exists(
        db
          .select({ id: appointments.id })
          .from(appointments)
          .where(stillPending),
      ),
    ),
    claim({
      paymentMethod,
      cashTransactionId: sql`(${db
        .select({ id: max(transactions.id) })
        .from(transactions)
        .where(eq(transactions.appointmentId, appointment.id))})`,
    }),
  ]);
  if (!updated.length)
    throw new ApiError(
      409,
      "O agendamento foi alterado por outra pessoa. Atualize a página.",
    );
}
