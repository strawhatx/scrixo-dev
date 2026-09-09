import { format, isValid, parse, parseISO } from "date-fns";

const PARSE_FORMATS = [
  "yyyy-MM-dd",
  "MM/dd/yyyy",
  "M/d/yyyy",
  "MM-dd-yyyy",
  "M-d-yyyy",
  "dd/MM/yyyy",
  "d/M/yyyy",
  "yyyyMMdd",
  "MMM d, yyyy",
  "MMMM d, yyyy",
  "MMM. d, yyyy",
];

const DATE_LIKE = /^\d{1,4}[/-]\d{1,2}[/-]\d{1,4}$|^D:\d{8}|^\d{4}-\d{2}-\d{2}|^[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}$/;

export function parseFormDate(raw: string | undefined | null): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const pdf = /^D:(\d{4})(\d{2})(\d{2})/.exec(trimmed);
  if (pdf) {
    const d = new Date(Number(pdf[1]), Number(pdf[2]) - 1, Number(pdf[3]));
    return isValid(d) ? d : null;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    const iso = parseISO(trimmed.slice(0, 10));
    if (isValid(iso)) return iso;
  }

  for (const pattern of PARSE_FORMATS) {
    const d = parse(trimmed, pattern, new Date());
    if (isValid(d) && d.getFullYear() > 1900 && d.getFullYear() < 2100) return d;
  }

  return null;
}

export function looksLikeDate(raw: string | undefined | null): boolean {
  if (!raw) return false;
  return DATE_LIKE.test(raw.trim()) && Boolean(parseFormDate(raw));
}

export function toDateInputValue(raw: string | undefined | null): string {
  const d = parseFormDate(raw);
  return d ? format(d, "yyyy-MM-dd") : "";
}

export function toDateDisplay(raw: string | undefined | null): string {
  const d = parseFormDate(raw);
  return d ? format(d, "MM/dd/yyyy") : "";
}

/** Value written back into AcroForm text/date widgets. */
export function toPdfDateValue(raw: string | undefined | null): string {
  const d = parseFormDate(raw);
  return d ? format(d, "MM/dd/yyyy") : (raw ?? "").trim();
}
