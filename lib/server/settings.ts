/** Configurações do negócio (uma única linha na tabela `business_settings`). */
import { eq } from "drizzle-orm";
import type { Database } from "../../db";
import { businessSettings } from "../../db/schema";
import { parseOpeningHours, type OpeningHours } from "../domain/schedule";

export async function getSettings(db: Database) {
  const [row] = await db
    .select()
    .from(businessSettings)
    .where(eq(businessSettings.id, 1))
    .limit(1);
  if (row) return row;
  const [created] = await db
    .insert(businessSettings)
    .values({ id: 1 })
    .onConflictDoNothing()
    .returning();
  return (
    created ??
    (
      await db
        .select()
        .from(businessSettings)
        .where(eq(businessSettings.id, 1))
        .limit(1)
    )[0]
  );
}

export async function getOpeningHours(db: Database): Promise<OpeningHours> {
  return parseOpeningHours((await getSettings(db))?.openingHours);
}

export async function saveOpeningHours(db: Database, hours: OpeningHours) {
  await getSettings(db);
  await db
    .update(businessSettings)
    .set({ openingHours: JSON.stringify(hours) })
    .where(eq(businessSettings.id, 1));
}
