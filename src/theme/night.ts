/**
 * "Moonlight" night theme, in its warmer, dimmer "Dusk" colours (less blue light
 * in a dark nursery): deep indigo, soft mauve text, rounded pill
 * buttons, warm peach for "check-in due". No white anywhere, so nothing
 * flashes bright in a dark nursery.
 */
export const colors = {
  bg: '#0A0918',
  surface: '#16122A',
  border: '#302848',
  text: '#D2C6DE', // main text, countdown digits
  textDim: '#9486AE', // labels
  textFaint: '#8C80AA', // small print (4.5:1 even on cards and buttons)
  primary: '#A38DC2', // mauve: progress ring, main button
  onPrimary: '#0A0918',
  buttonBg: '#1F1A36', // secondary button + ring track
  dotEmpty: '#4F4470',
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
