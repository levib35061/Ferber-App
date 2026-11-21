/**
 * Free trial: the first FREE_NIGHTS nights are free with every feature. After
 * that, starting a NEW night needs the one-time unlock. A night already under
 * way is never interrupted, and History / Today / Progress stay viewable.
 * Nights are counted per family (partners share them), across all rounds.
 */
export const FREE_NIGHTS = 2;
export const UNLOCK_PRICE = '$2.99'; // replaced by the store's localized price once purchases are live

export function freeNightsLeft(nightsUsed: number): number {
  return Math.max(0, FREE_NIGHTS - nightsUsed);
}

/**
 * Should this tap open the unlock screen instead?
 * @param startsNewNight  the tap would create tonight's night (no night row with taps yet)
 */
export function needsUnlock(opts: { unlocked: boolean; nightsUsed: number; startsNewNight: boolean }): boolean {
  return !opts.unlocked && opts.startsNewNight && opts.nightsUsed >= FREE_NIGHTS;
}
