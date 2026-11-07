import { z } from "zod";
import { getDb } from "../../../db";
import { timeToMinutes } from "../../../lib/domain/schedule";
import { adminRoute, ok, readBody } from "../../../lib/server/http";
import {
  getOpeningHours,
  saveOpeningHours,
} from "../../../lib/server/settings";

export const dynamic = "force-dynamic";

export const GET = adminRoute(async () =>
  ok({ openingHours: await getOpeningHours(getDb()) }),
);

const time = z
  .string()
  .refine(
    (value) => Number.isFinite(timeToMinutes(value)),
    "Informe um horário válido.",
  );
const day = z
  .object({ open: z.boolean(), start: time, end: time })
  .refine(
    (value) =>
      !value.open || timeToMinutes(value.start) < timeToMinutes(value.end),
    "O fechamento precisa ser depois da abertura.",
  );

const body = z.object({ openingHours: z.array(day).length(7) });

export const PUT = adminRoute(async ({ request }) => {
  const { openingHours } = await readBody(request, body);
  await saveOpeningHours(getDb(), openingHours);
  return ok({ openingHours });
});
