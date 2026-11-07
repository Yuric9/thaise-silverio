/**
 * Regras da agenda: horário de atendimento, horários disponíveis e
 * conflitos. Funções puras — não acessam banco de dados.
 *
 * A Thaise atende sozinha, então existe um único "recurso" na agenda
 * (`STUDIO`): dois atendimentos nunca ocupam o mesmo horário.
 */
import { isDateKey, weekday } from "./dates.ts";

/** Os horários são oferecidos em intervalos de 30 minutos. */
export const SLOT_MINUTES = 30;

/** Bloqueio que ocupa o dia todo (valor gravado em `schedule_blocks.time`). */
export const FULL_DAY_BLOCK = "Dia inteiro";

/** Recurso único reservado na tabela `appointment_slots`. */
export const STUDIO = "studio";

export type DayHours = { open: boolean; start: string; end: string };
/** Horário por dia da semana: posição 0 = domingo … 6 = sábado. */
export type OpeningHours = DayHours[];

export const WEEKDAY_NAMES = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
] as const;

/**
 * Horário inicial, usado até a Thaise ajustar em Configurações:
 * segunda a sábado, das 9h às 18h; domingo fechado.
 */
export const DEFAULT_OPENING_HOURS: OpeningHours = [
  { open: false, start: "09:00", end: "18:00" },
  { open: true, start: "09:00", end: "18:00" },
  { open: true, start: "09:00", end: "18:00" },
  { open: true, start: "09:00", end: "18:00" },
  { open: true, start: "09:00", end: "18:00" },
  { open: true, start: "09:00", end: "18:00" },
  { open: true, start: "09:00", end: "18:00" },
];

export function timeToMinutes(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return Number.NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return Number.NaN;
  return hours * 60 + minutes;
}

export function minutesToTime(total: number) {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function isValidDay(day: unknown): day is DayHours {
  if (!day || typeof day !== "object") return false;
  const { open, start, end } = day as DayHours;
  const a = timeToMinutes(start);
  const b = timeToMinutes(end);
  return (
    typeof open === "boolean" &&
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    a < b
  );
}

/** Lê o horário gravado no banco (JSON). Valores inválidos voltam ao padrão. */
export function parseOpeningHours(
  raw: string | null | undefined,
): OpeningHours {
  if (!raw) return DEFAULT_OPENING_HOURS;
  try {
    const value = JSON.parse(raw);
    if (Array.isArray(value) && value.length === 7 && value.every(isValidDay))
      return value;
  } catch {
    // JSON inválido: usa o padrão.
  }
  return DEFAULT_OPENING_HOURS;
}

/** Janela de atendimento de uma data (minutos desde a meia-noite) ou `null` se fechado. */
export function operatingWindow(
  date: string,
  hours: OpeningHours = DEFAULT_OPENING_HOURS,
) {
  if (!isDateKey(date)) return null;
  const day = hours[weekday(date)];
  if (!day?.open) return null;
  return { start: timeToMinutes(day.start), end: timeToMinutes(day.end) };
}

/** Horários de início em que um atendimento com essa duração cabe antes do fechamento. */
export function startTimesFor(
  date: string,
  durationMin: number,
  hours: OpeningHours = DEFAULT_OPENING_HOURS,
) {
  const window = operatingWindow(date, hours);
  if (!window) return [];
  const duration = Math.max(
    SLOT_MINUTES,
    Math.round(durationMin) || SLOT_MINUTES,
  );
  const times: string[] = [];
  for (
    let minutes = window.start;
    minutes + duration <= window.end;
    minutes += SLOT_MINUTES
  ) {
    times.push(minutesToTime(minutes));
  }
  return times;
}

/** Faixas de 30 minutos ocupadas por um atendimento que começa em `time`. */
export function slotsCovered(time: string, durationMin: number) {
  const start = timeToMinutes(time);
  const count = Math.max(1, Math.ceil(durationMin / SLOT_MINUTES));
  return Array.from({ length: count }, (_, index) =>
    minutesToTime(start + index * SLOT_MINUTES),
  );
}

export function overlaps(
  startA: number,
  durationA: number,
  startB: number,
  durationB: number,
) {
  return startA < startB + durationB && startB < startA + durationA;
}

/** Um bloqueio de agenda afeta um atendimento que começa em `start`? */
export function blockAffects(
  blockTime: string,
  start: string,
  durationMin: number,
) {
  if (blockTime === FULL_DAY_BLOCK) return true;
  const a = timeToMinutes(start);
  const b = timeToMinutes(blockTime);
  return (
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    overlaps(a, durationMin, b, SLOT_MINUTES)
  );
}

/** O horário já passou? (para a data de hoje) */
export function isPastSlot(
  date: string,
  time: string,
  today: string,
  currentMinutes: number,
) {
  if (date < today) return true;
  return date === today && timeToMinutes(time) <= currentMinutes;
}

export type SlotLock = { time: string };
export type ScheduleBlock = { time: string };

/** O horário está livre (sem bloqueio e sem outro atendimento)? */
export function isSlotFree(options: {
  time: string;
  durationMin: number;
  locks: SlotLock[];
  blocks: ScheduleBlock[];
}) {
  if (
    options.blocks.some((block) =>
      blockAffects(block.time, options.time, options.durationMin),
    )
  )
    return false;
  const needed = slotsCovered(options.time, options.durationMin);
  return !needed.some((slot) =>
    options.locks.some((lock) => lock.time === slot),
  );
}
