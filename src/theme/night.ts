/**
 * "Moonlight" night theme: deep navy, soft lavender-blue text, rounded pill
 * buttons, warm peach for "check-in due". No white anywhere, so nothing
 * flashes bright in a dark nursery.
 */
export const colors = {
  bg: '#070B1C',
  surface: '#111733',
  border: '#2A3150',
  text: '#D4DBFA', // main text, countdown digits
  textDim: '#8E99CC', // labels
  textFaint: '#6E7AAE', // small print (still 4.5:1 on bg)
  primary: '#9AA8E8', // lavender: progress ring, main button
  onPrimary: '#070B1C',
  buttonBg: '#1A2142', // secondary button + ring track
  dotEmpty: '#4A557F',
  accent: '#F2A98B', // peach: check-in due
  accentText: '#F7C9B6',
  accentDim: '#C99583',
  onAccent: '#1C0D07',
} as const;

/** Nunito, loaded in the root layout. With custom fonts, pick the weight by family, not fontWeight. */
export const fonts = {
  light: 'Nunito_300Light',
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
} as const;

export const type = {
  countdown: 84, // spec: at least 72pt
  huge: 34,
  big: 24,
  body: 17,
  small: 14,
} as const;
