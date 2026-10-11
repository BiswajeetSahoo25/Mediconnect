import { ServiceError } from "../../errors/http-errors.js";

export interface FacilityLocalDateTime {
  date: string;
  weekday: number;
  hour: number;
  minute: number;
  second: number;
}
const formatterCache = new Map<string, Intl.DateTimeFormat>();
const wallTimeCache = new Map<string, number[]>();
const SLOT_DURATION_MINUTES = 30;

function getFormatter(timeZone: string) {
  let formatter = formatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      calendar: "iso8601",
      numberingSystem: "latn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23",
    });
    formatterCache.set(timeZone, formatter);
  }
  return formatter;
}

export function assertValidTimeZone(timeZone: string) {
  try {
    getFormatter(timeZone);
  } catch {
    throw new ServiceError(
      "The facility has an invalid timezone configuration",
      500,
    );
  }
}

export function getFacilityLocalDateTime(
  instant: Date,
  timeZone: string,
): FacilityLocalDateTime {
  assertValidTimeZone(timeZone);
  const parts = getFormatter(timeZone).formatToParts(instant);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    weekday: getWeekdayForLocalDate(
      `${values.year}-${values.month}-${values.day}`,
    ),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

/** Get a weekday from a calendar date without applying the server timezone. */
export function getWeekdayForLocalDate(date: string) {
  const [year = 1970, month = 1, day = 1] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function addLocalDays(date: string, days: number) {
  const [year = 1970, month = 1, day = 1] = date.split("-").map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return `${result.getUTCFullYear()}-${String(result.getUTCMonth() + 1).padStart(2, "0")}-${String(result.getUTCDate()).padStart(2, "0")}`;
}

export function localDateToDatabaseDate(date: string) {
  return new Date(`${date}T00:00:00.000Z`);
}

function parseAvailabilityTime(value: Date) {
  return value.getUTCHours() * 60 + value.getUTCMinutes();
}

function formatMinutes(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function buildAppointmentSlots(
  date: string,
  timeZone: string,
  availability: Array<{ startTime: Date; endTime: Date }>,
  now: Date,
) {
  const byStartAt = new Map<
    string,
    { startAt: string; startTime: string; endTime: string }
  >();

  for (const window of availability) {
    const startMinute = parseAvailabilityTime(window.startTime);
    const endMinute = parseAvailabilityTime(window.endTime);
    if (endMinute <= startMinute) continue;

    for (
      let minute = startMinute;
      minute + SLOT_DURATION_MINUTES <= endMinute;
      minute += SLOT_DURATION_MINUTES
    ) {
      const startInstants = getInstantsForFacilityWallTime(date, minute, timeZone);
      const endInstants = getInstantsForFacilityWallTime(
        date,
        minute + SLOT_DURATION_MINUTES,
        timeZone,
      );
      // Skip DST gaps and repeated wall times instead of choosing an instant
      // that patients could not identify unambiguously.
      if (startInstants.length !== 1 || endInstants.length !== 1) continue;
      const startAt = startInstants[0];
      const endAt = endInstants[0];
      if (!startAt || !endAt) continue;
      if (
        endAt.getTime() - startAt.getTime() !==
        SLOT_DURATION_MINUTES * 60_000
      ) {
        continue;
      }
      if (startAt <= now) continue;

      const startAtIso = startAt.toISOString();
      byStartAt.set(startAtIso, {
        startAt: startAtIso,
        startTime: formatMinutes(minute),
        endTime: formatMinutes(minute + SLOT_DURATION_MINUTES),
      });
    }
  }

  const ordered = [...byStartAt.values()].sort((left, right) =>
    left.startAt.localeCompare(right.startAt),
  );
  let previousEnd = Number.NEGATIVE_INFINITY;
  return ordered.filter((slot) => {
    const start = Date.parse(slot.startAt);
    if (start < previousEnd) return false;
    previousEnd = start + SLOT_DURATION_MINUTES * 60_000;
    return true;
  });
}

function getLocalParts(instantMs: number, timeZone: string) {
  const parts = getFormatter(timeZone).formatToParts(new Date(instantMs));
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  };
}

/**
 * Resolve facility wall time to an instant. Empty means a DST gap; multiple
 * values mean a repeated wall time during a DST fold. Callers can then omit
 * ambiguous/nonexistent starts instead of silently choosing an instant.
 */
export function getInstantsForFacilityWallTime(
  date: string,
  minutesAfterMidnight: number,
  timeZone: string,
) {
  assertValidTimeZone(timeZone);
  const normalizedDate = addLocalDays(date, Math.floor(minutesAfterMidnight / 1440));
  const localMinutes = ((minutesAfterMidnight % 1440) + 1440) % 1440;
  const cacheKey = `${timeZone}|${normalizedDate}|${localMinutes}`;
  const cached = wallTimeCache.get(cacheKey);
  if (cached) return cached.map((ms) => new Date(ms));
  const [year = 1970, month = 1, day = 1] = normalizedDate.split("-").map(Number);
  const hour = Math.floor(localMinutes / 60);
  const minute = localMinutes % 60;
  const wallTimeAsUtc = Date.UTC(year, month - 1, day, hour, minute);
  const offsets = new Set<number>();

  // Sample either side of the wall time so both offsets around a DST fold are
  // considered. This is independent of the server's timezone.
  for (let offsetHours = -36; offsetHours <= 36; offsetHours += 3) {
    const sample = wallTimeAsUtc + offsetHours * 60 * 60 * 1000;
    const local = getLocalParts(sample, timeZone);
    const localAsUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
    );
    offsets.add(localAsUtc - Math.floor(sample / 1000) * 1000);
  }

  const candidates = new Set<number>();
  for (const offset of offsets) {
    const candidate = wallTimeAsUtc - offset;
    const local = getLocalParts(candidate, timeZone);
    if (
      local.year === year &&
      local.month === month &&
      local.day === day &&
      local.hour === hour &&
      local.minute === minute &&
      local.second === 0
    ) {
      candidates.add(candidate);
    }
  }

  const instants = [...candidates].sort((left, right) => left - right);
  wallTimeCache.set(cacheKey, instants);
  return instants.map((ms) => new Date(ms));
}
