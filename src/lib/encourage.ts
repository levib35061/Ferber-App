/**
 * Short, calm lines for the hard moments of a night. Plain and true, never
 * cheerful: "would I say this to a tired friend?" Pure and tested.
 *
 * Grounded in Ferber's own wording: a check-in is "to reassure him (and
 * yourself), not necessarily to help him stop crying", and progress usually
 * takes "a few days, two weeks at the most", rarely in a straight line.
 */

export const IN_ROOM_NOTE = "A pat and a few soft words, then out. You're here to reassure, not to stop the crying.";

/** A line to show under the countdown while waiting, or null for none. */
export function waitingNote(o: {
  nightNumber: number;
  /** Check-ins already done in this stretch */
  checkInsDone: number;
  /** A night waking rather than bedtime */
  waking: boolean;
  /** Local hour, 0–23 */
  hour: number;
}): string | null {
  if (o.checkInsDone >= 1) return 'Crying after a check-in is normal. You went in to reassure, not to stop it.';
  if (o.waking && o.hour < 5) return 'Middle-of-the-night wakings are the hardest part. Same plan as bedtime.';
  if (!o.waking && o.nightNumber >= 2 && o.nightNumber <= 4) {
    return 'Nights 2 to 4 are often harder than the first. That is normal.';
  }
  return null;
}
