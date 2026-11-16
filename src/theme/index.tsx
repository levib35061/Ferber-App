/**
 * App theme: "Moonlight" at night (6pm–7am), "Peach & plum" during the day.
 *
 * Screens read colors and fonts from `useTheme()` and build styles with
 * `makeStyles`, so they switch automatically. The active night screens
 * (countdown, check-in due, in the room) wrap themselves in
 * <ThemeProvider mode="night"> so they stay dark even in the afternoon.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';

import { isNightTime } from '../lib/time';
import { colors as nightColors, fonts as nightFonts, type } from './night';

export type Mode = 'night' | 'day';
export type Palette = { [K in keyof typeof nightColors]: string };
export type FontSet = { [K in keyof typeof nightFonts]: string };

export interface Theme {
  mode: Mode;
  colors: Palette;
  fonts: FontSet;
  type: typeof type;
  /** For native pickers and the status bar */
  scheme: 'dark' | 'light';
}

const dayColors: Palette = {
  bg: '#FFE6DC',
  surface: '#FFF7F3',
  border: '#F0CFC2',
  text: '#3B1631',
  textDim: '#6E4560',
  textFaint: '#7A5068',
  primary: '#3B1631',
  onPrimary: '#FFFFFF',
  buttonBg: '#FAD3C5',
  dotEmpty: '#D9B3C2',
  accent: '#C4321A',
  accentText: '#C4321A',
  accentDim: '#9C4A3A',
  onAccent: '#FFFFFF',
};

/** Daytime type: Plus Jakarta Sans. */
const dayFonts: FontSet = {
  light: 'PlusJakartaSans_400Regular',
  regular: 'PlusJakartaSans_400Regular',
  semibold: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const nightTheme: Theme = { mode: 'night', colors: nightColors, fonts: nightFonts, type, scheme: 'dark' };
export const dayTheme: Theme = { mode: 'day', colors: dayColors, fonts: dayFonts, type, scheme: 'light' };

const ThemeCtx = createContext<Theme>(nightTheme);

export function useTheme(): Theme {
  return useContext(ThemeCtx);
}

/** Night or day by the clock, re-checked every minute. */
export function useClockMode(): Mode {
  const [mode, setMode] = useState<Mode>(() => (isNightTime(Date.now()) ? 'night' : 'day'));
  useEffect(() => {
    const id = setInterval(() => setMode(isNightTime(Date.now()) ? 'night' : 'day'), 60_000);
    return () => clearInterval(id);
  }, []);
  return mode;
}

/** Provides the theme. Without `mode`, follows the clock. */
export function ThemeProvider({ mode, children }: { mode?: Mode; children: React.ReactNode }) {
  const clock = useClockMode();
  const m = mode ?? clock;
  return <ThemeCtx.Provider value={m === 'night' ? nightTheme : dayTheme}>{children}</ThemeCtx.Provider>;
}

/** Like StyleSheet.create, but built per theme: `const useStyles = makeStyles((t) => StyleSheet.create({...}))`. */
export function makeStyles<T>(build: (t: Theme) => T): () => T {
  const cache: Partial<Record<Mode, T>> = {};
  return function useStyles() {
    const t = useTheme();
    return (cache[t.mode] ??= build(t));
  };
}
