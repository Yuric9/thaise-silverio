import { getDb } from "../../../../db";
import {
  availabilityQuery,
  siteAvailability,
} from "../../../../lib/server/booking";
import { ok, publicRoute } from "../../../../lib/server/http";

export const dynamic = "force-dynamic";

/** Horários livres de um procedimento num dia (público: só os horários). */
export const GET = publicRoute(async (request) => {
  const params = new URL(request.url).searchParams;
  const input = availabilityQuery.parse({
    date: params.get("date"),
    serviceId: params.get("serviceId"),
  });
  return ok(await siteAvailability(getDb(), input));
});
