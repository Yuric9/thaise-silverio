/**
 * Retoque e manutenção da micropigmentação: em que fase a cliente está,
 * a partir do último atendimento finalizado. Funções puras.
 */

/** Antecedência para lembrar do retoque (dias antes da data ideal). */
export const TOUCH_UP_EARLY_DAYS = 5;
/** Depois disso, o lembrete de retoque deixa de fazer sentido. */
export const TOUCH_UP_LATE_DAYS = 30;
/** Manutenção anual: entre 11 e 13 meses depois do procedimento. */
export const MAINTENANCE_FROM_DAYS = 330;
export const MAINTENANCE_TO_DAYS = 400;

/** Maior prazo de retoque entre os procedimentos de um atendimento ("A + B"). */
export function touchUpDaysFor(
  serviceName: string | null,
  services: { name: string; touchUpDays: number }[],
) {
  if (!serviceName) return 0;
  const names = serviceName.split(" + ").map((name) => name.trim());
  return services
    .filter((service) => names.includes(service.name))
    .reduce((max, service) => Math.max(max, service.touchUpDays), 0);
}

export function isTouchUpDue(
  daysSinceVisit: number | null,
  touchUpDays: number,
) {
  if (daysSinceVisit === null || touchUpDays <= 0) return false;
  return (
    daysSinceVisit >= touchUpDays - TOUCH_UP_EARLY_DAYS &&
    daysSinceVisit <= touchUpDays + TOUCH_UP_LATE_DAYS
  );
}

export function isMaintenanceDue(
  daysSinceVisit: number | null,
  touchUpDays: number,
) {
  if (daysSinceVisit === null || touchUpDays <= 0) return false;
  return (
    daysSinceVisit >= MAINTENANCE_FROM_DAYS &&
    daysSinceVisit <= MAINTENANCE_TO_DAYS
  );
}
