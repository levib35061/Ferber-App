/**
 * The shareable progress card ("Night 1: 43 min → Night 5: 8 min"), offered
 * on the Today screen after a good morning. Pure and tested.
 *
 * Only offered when it's genuinely good news, so the card never feels like
 * a scorecard: at least 3 nights in this round, last night no worse than the
 * one before, and crying down by at least 40% since night 1.
 */

export interface RoundNight {
  nightNumber: number;
  cryingMinutes: number;
}

export interface ShareCard {
  headline: string;
  /** "Night 1 → night 5" */
  span: string;
  /** Up to the last 7 nights, oldest first */
  bars: RoundNight[];
  /** Text sent with the image */
  message: string;
}

const MAX_BARS = 7;

/** The nights of the current training round (from the latest night 1), oldest first. */
export function currentRound(nightsOldestFirst: RoundNight[]): RoundNight[] {
  let start = 0;
  nightsOldestFirst.forEach((n, i) => {
    if (n.nightNumber === 1) start = i;
  });
  return nightsOldestFirst.slice(start);
}

const mins = (n: number) => `${n}\u00A0min`;

export function shareCard(round: RoundNight[], name = ''): ShareCard | null {
  if (round.length < 3) return null;
  const first = round[0];
  const last = round[round.length - 1];
  const prev = round[round.length - 2];
  if (first.cryingMinutes <= 0) return null;
  if (last.cryingMinutes > prev.cryingMinutes) return null;
  if (last.cryingMinutes > first.cryingMinutes * 0.6) return null;

  const who = name.trim();
  const headline =
    last.cryingMinutes === 0
      ? `From ${mins(first.cryingMinutes)} of crying to none`
      : `Crying down from ${mins(first.cryingMinutes)} to ${mins(last.cryingMinutes)}`;
  const span = `Night ${first.nightNumber} → night ${last.nightNumber}`;
  const subject = who ? `${who}'s sleep training` : 'Sleep training';
  const message =
    last.cryingMinutes === 0
      ? `${subject}, night ${last.nightNumber}: from ${mins(first.cryingMinutes)} of crying on night ${first.nightNumber} to none. Timed with Check In: ferbertimer.com`
      : `${subject}, night ${last.nightNumber}: crying down from ${mins(first.cryingMinutes)} on night ${first.nightNumber} to ${mins(last.cryingMinutes)}. Timed with Check In: ferbertimer.com`;
  return { headline, span, bars: round.slice(-MAX_BARS), message };
}
