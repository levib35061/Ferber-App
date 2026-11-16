/**
 * Night-mode palette: dim amber and red on true black. No white anywhere,
 * so nothing flashes bright in a dark nursery.
 */
export const colors = {
  bg: '#000000',
  surface: '#120A02',
  border: '#3A2408',
  text: '#E39A3B', // dim amber
  textDim: '#8C5E24',
  textFaint: '#5A3C17',
  accent: '#C2412D', // dim red, for "check-in due"
  accentBg: '#2A0C06',
  buttonBg: '#1E1104',
} as const;

export const type = {
  countdown: 88, // spec: at least 72pt
  huge: 34,
  big: 24,
  body: 17,
  small: 14,
} as const;
