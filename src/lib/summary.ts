/**
 * Derived per-episode and per-night numbers. Computed from events, never stored.
 */
import { NightEvent, episodeCryingMs, episodes } from './session';

export { episodeCryingMs };

const MINUTE = 60_000;

/*
 * Crying minutes for an episode count only time spent crying or in the room
 * on a check-in. Quiet settling after "Down" (before "Crying") and stretches
 * after "Stopped crying" don't count. See walk() in session.ts.
 */

export interface NightSummary {
  cryingMinutes: number;
  checkIns: number;
  /** Number of wakings: episodes started by "woke" or a night feed (not the first "down") */
  wakings: number;
  longestEpisodeMinutes: number;
  episodeCount: number;
}

export function summarizeNight(events: NightEvent[], now?: number): NightSummary {
  const eps = episodes(events);
  let crying = 0;
  let longest = 0;
  let checkIns = 0;
  let wakings = 0;
  for (const ep of eps) {
    const ms = episodeCryingMs(ep, now);
    crying += ms;
    longest = Math.max(longest, ms);
    checkIns += ep.checkIns;
    if (ep.start.type === 'woke' || ep.start.type === 'feed_start') wakings += 1;
  }
  return {
    cryingMinutes: Math.round(crying / MINUTE),
    checkIns,
    wakings,
    longestEpisodeMinutes: Math.round(longest / MINUTE),
    episodeCount: eps.length,
  };
}
