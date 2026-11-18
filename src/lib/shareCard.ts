/**
 * The shareable progress card, on every morning's Today screen. Pure and tested.
 *
 * After a clearly good run (3+ nights this round, last night no worse than the
 * one before, crying down 40%+ since night 1) it celebrates the drop ("Crying
 * down from 43 min to 8 min") and is offered more prominently. Any other
 * morning it states last night plainly ("Night 2: 1 h 5 min of crying"), so it
 * never reads as a scorecard.
 */
import { formatMinutes } from './time';

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
  /** Clearly good news (offered more prominently) */
  celebrate: boolean;
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

/** Clearly good news: 3+ nights, last night no worse than the one before, crying down 40%+ since night 1. */
export function isGoodRun(round: RoundNight[]): boolean {
  if (round.length < 3) return false;
  const first = round[0];
  const last = round[round.length - 1];
  const prev = round[round.length - 2];
  return (
    first.cryingMinutes > 0 && last.cryingMinutes <= prev.cryingMinutes && last.cryingMinutes <= first.cryingMinutes * 0.6
  );
}

const FOOTER = 'Timed with Check In: ferbertimer.com';

/** The card for any morning with a logged night (null only when there's no night yet). */
export function shareCard(round: RoundNight[], name = ''): ShareCard | null {
  if (!round.length) return null;
  const first = round[0];
  const last = round[round.length - 1];
  const who = name.trim();
  const subject = who ? `${who}'s sleep training` : 'Sleep training';
  const bars = round.length >= 2 ? round.slice(-MAX_BARS) : [];
  const span = round.length >= 2 ? `Night ${first.nightNumber} → night ${last.nightNumber}` : `Night ${last.nightNumber}`;
  const celebrate = isGoodRun(round);

  if (celebrate) {
    const from = formatMinutes(first.cryingMinutes);
    const to = formatMinutes(last.cryingMinutes);
    const headline = last.cryingMinutes === 0 ? `From ${from} of crying to none` : `Crying down from ${from} to ${to}`;
    const message =
      last.cryingMinutes === 0
        ? `${subject}, night ${last.nightNumber}: from ${from} of crying on night ${first.nightNumber} to none. ${FOOTER}`
        : `${subject}, night ${last.nightNumber}: crying down from ${from} on night ${first.nightNumber} to ${to}. ${FOOTER}`;
    return { headline, span, bars, message, celebrate };
  }

  // Any other morning: just last night, stated plainly. No judgement either way.
  const amount = last.cryingMinutes === 0 ? 'no crying' : `${formatMinutes(last.cryingMinutes)} of crying`;
  const headline = `Night ${last.nightNumber}: ${amount}`;
  const message = `${subject}, night ${last.nightNumber}: ${amount}. ${FOOTER}`;
  return { headline, span, bars, message, celebrate };
}
