import { z } from "zod";
import { getDb } from "../../../../db";
import { availableTimes } from "../../../../lib/server/appointments";
import { adminRoute, ok } from "../../../../lib/server/http";
import { dateKey } from "../../../../lib/server/validation";

export const dynamic = "force-dynamic";

const query = z.object({
  date: dateKey,
  serviceIds: z
    .string()
    .transform((value) => value.split(",").filter(Boolean).map(Number))
    .pipe(
      z
        .array(z.number().int().positive())
        .min(1, "Escolha pelo menos um procedimento."),
    ),
});

/** Horários livres para uma data, considerando duração, reservas e bloqueios. */
export const GET = adminRoute(async ({ request }) => {
  const params = new URL(request.url).searchParams;
  const input = query.parse({
    date: params.get("date"),
    serviceIds: params.get("serviceIds") ?? "",
  });
  return ok(await availableTimes(getDb(), input));
});
