const DEFAULT_TIMEZONE = "America/Sao_Paulo";

export function nowUtc() {
  return new Date();
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? "0");

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second")
  };
}

function getTimeZoneOffsetMs(referenceInstant: Date, timeZone: string) {
  const zoned = getTimeZoneParts(referenceInstant, timeZone);
  const zonedAsUtc = Date.UTC(
    zoned.year,
    zoned.month - 1,
    zoned.day,
    zoned.hour,
    zoned.minute,
    zoned.second,
    0
  );
  const utcWithoutMs = Date.UTC(
    referenceInstant.getUTCFullYear(),
    referenceInstant.getUTCMonth(),
    referenceInstant.getUTCDate(),
    referenceInstant.getUTCHours(),
    referenceInstant.getUTCMinutes(),
    referenceInstant.getUTCSeconds(),
    0
  );

  return zonedAsUtc - utcWithoutMs;
}

function timeZoneDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  millisecond: number,
  timeZone: string
) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
  const offsetMs = getTimeZoneOffsetMs(utcGuess, timeZone);
  return new Date(utcGuess.getTime() - offsetMs);
}

export function getBusinessDayRange(
  referenceDate: Date = nowUtc(),
  timeZone: string = DEFAULT_TIMEZONE
) {
  const local = getTimeZoneParts(referenceDate, timeZone);
  return {
    start: timeZoneDateTimeToUtc(local.year, local.month, local.day, 0, 0, 0, 0, timeZone),
    end: timeZoneDateTimeToUtc(local.year, local.month, local.day, 23, 59, 59, 999, timeZone)
  };
}

export function getBusinessMonthRange(
  month: number,
  year: number,
  timeZone: string = DEFAULT_TIMEZONE
) {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return {
    start: timeZoneDateTimeToUtc(year, month, 1, 0, 0, 0, 0, timeZone),
    end: timeZoneDateTimeToUtc(year, month, lastDay, 23, 59, 59, 999, timeZone)
  };
}

export function getYearInTimeZone(date: Date, timeZone: string = DEFAULT_TIMEZONE) {
  return getTimeZoneParts(date, timeZone).year;
}

export function formatDateTimeForDisplay(
  date: Date,
  timeZone: string = DEFAULT_TIMEZONE
) {
  const { dayBr, timeBr, zone } = getDisplayDateParts(date, timeZone);
  return `${dayBr}, ${timeBr} ${zone}`;
}

export function getDisplayDateParts(
  date: Date,
  timeZone: string = DEFAULT_TIMEZONE
) {
  const formatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZoneName: "short"
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, "0");
  const dayBr = `${getPart("day")}/${getPart("month")}/${getPart("year")}`;
  const timeBr = `${getPart("hour")}:${getPart("minute")}:${getPart("second")},${milliseconds}`;
  const zone = getPart("timeZoneName");

  return { dayBr, timeBr, zone };
}

export const BUSINESS_TIMEZONE = DEFAULT_TIMEZONE;
export const DISPLAY_TIMEZONE = DEFAULT_TIMEZONE;
