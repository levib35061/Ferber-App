import { useEffect, useState } from 'react';

/**
 * Current time, re-rendering every `intervalMs`. Only used to redraw the
 * countdown; the countdown's value always comes from stored timestamps.
 */
export function useNow(intervalMs = 250, active = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, active]);
  return now;
}
