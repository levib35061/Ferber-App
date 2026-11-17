/**
 * Time helpers. All stored times are UTC epoch milliseconds; these only
 * interpret them in the device's local time zone for display and grouping.
 */

/** A night runs 5pm–11am local. Events before 11am belong to the previous evening. */
export const NIGHT_ENDS_HOUR = 11;
export const NIGHT_STARTS_HOUR = 17;

/**
 * The local calendar date ("YYYY-MM-DD") of the evening a timestamp belongs to.
 * 2am on the 15th -> "…-14". 7pm on the 14th -> "…-14".
 * Times between 11am and 5pm are grouped with the coming evening.
 */
export function nightKey(atMs: number): string {
  const d = new Date(atMs);
  if (d.getHours() < NIGHT_ENDS_HOUR) d.setDate(d.getDate() - 1);
  return localDateString(d);
}

export function localDateString(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** True between 6pm and 7am local: the Night screen is the default then. */
export function isNightTime(atMs: number): boolean {
  const h = new Date(atMs).getHours();
  return h >= 18 || h < 7;
}

/** 252_000 ms -> "4:12"; 3_725_000 -> "1:02:05". Negative clamps to 0. */
/** For VoiceOver: "4 minutes 12 seconds" (same rounding as formatDuration). */
export function spokenDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const part = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;
  const parts = [h && part(h, 'hour'), m && part(m, 'minute'), (s || (!h && !m)) && part(s, 'second')].filter(Boolean);
  return parts.join(' ');
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`;
  return `${m}:${ss}`;
}

export function formatClock(atMs: number): string {
  return new Date(atMs).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * The timestamp for a local clock time within a given night.
 * A night "YYYY-MM-DD" runs from 11am that day to 11am the next, so
 * 9:30pm lands on that date and 2:15am lands on the following date.
 */
export function atTimeInNight(key: string, hour: number, minute: number): number {
  const [y, m, d] = key.split('-').map(Number);
  const dayOffset = hour < NIGHT_ENDS_HOUR ? 1 : 0;
  return new Date(y, m - 1, d + dayOffset, hour, minute, 0, 0).getTime();
}

/** Whole months between a "YYYY-MM-DD" birth date and `now` (local time). */
export function ageInMonths(birthDate: string, now: number = Date.now()): number {
  const [y, m, d] = birthDate.split('-').map(Number);
  const n = new Date(now);
  let months = (n.getFullYear() - y) * 12 + (n.getMonth() - (m - 1));
  if (n.getDate() < d) months -= 1;
  return Math.max(0, months);
}

/** 5am–11am: "Up for the day" is offered. */
export function isMorningWindow(atMs: number): boolean {
  const h = new Date(atMs).getHours();
  return h >= 5 && h < NIGHT_ENDS_HOUR;
}

/** Before 6am, wakings are usually still treated as night wakings. */
export function isVeryEarly(atMs: number): boolean {
  return new Date(atMs).getHours() < 6;
}
