/**
 * Deterministic UUIDs. A night's id is derived from (baby id, night date),
 * so if both parents start the same night while offline, both phones create
 * the same row and sync merges it instead of making a duplicate.
 */

/** Formats 32+ hex chars (e.g. a SHA-1 digest) as a version-5-style UUID. */
export function uuidFromHex(hex: string): string {
  const h = hex.toLowerCase().replace(/[^0-9a-f]/g, '');
  if (h.length < 32) throw new Error('need at least 32 hex characters');
  const variant = ((parseInt(h[16], 16) & 0x3) | 0x8).toString(16);
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-${variant}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export function nightIdSeed(babyId: string, nightKey: string): string {
  return `night:${babyId}:${nightKey}`;
}
