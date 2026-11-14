import { getDb } from "../../../db";
import {
  bookableServices,
  bookingRequestSchema,
  bookingSettings,
  requestBooking,
} from "../../../lib/server/booking";
import { ApiError, ok, publicRoute, readBody } from "../../../lib/server/http";
import { publicFormLimit } from "../../../lib/server/rate-limit";

export const dynamic = "force-dynamic";

/** Procedimentos e prazo do agendamento pelo site (público). */
export const GET = publicRoute(async () => {
  const db = getDb();
  const booking = await bookingSettings(db);
  return ok({
    maxDaysAhead: booking.maxDaysAhead,
    services: await bookableServices(db),
  });
});

/** Pedido de agendamento feito pela própria cliente (público). */
export const POST = publicRoute(async (request) => {
  const input = await readBody(request, bookingRequestSchema);
  // Robô preencheu o campo escondido: finge que deu certo e não guarda nada.
  if (input.website) return ok({ ok: true }, 201);

  const limit = await publicFormLimit(request, "booking", 5);
  if (limit.blocked)
    throw new ApiError(
      429,
      "Recebemos vários pedidos seguidos. Tente de novo mais tarde ou chame a Thaise no WhatsApp.",
    );

  const appointment = await requestBooking(getDb(), input);
  return ok(
    {
      ok: true,
      date: appointment.date,
      time: appointment.time,
      service: appointment.serviceName,
    },
    201,
  );
});
