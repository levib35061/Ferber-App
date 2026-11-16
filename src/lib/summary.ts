/**
 * Derived per-episode and per-night numbers. Computed from events, never stored.
 */
import { Episode, NightEvent, episodes } from './session';

const MINUTE = 60_000;

/**
 * Crying minutes for an episode = asleep.at − (down or woke).at,
 * including time spent on check-ins. Open episodes count up to `now`
 * if given, otherwise 0.
 */
export function episodeCryingMs(ep: Episode, now?: number): number {
  const end = ep.end?.at ?? now;
  if (end == null) return 0;
  return Math.max(0, end - ep.start.at);
}

export interface NightSummary {
  cryingMinutes: number;
  checkIns: number;
  /** Number of "woke" episodes (not counting the first "down") */
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
    if (ep.start.type === 'woke') wakings += 1;
  }
  return {
    cryingMinutes: Math.round(crying / MINUTE),
    checkIns,
    wakings,
    longestEpisodeMinutes: Math.round(longest / MINUTE),
    episodeCount: eps.length,
  };
}
