/**
 * "Peach & plum" daytime theme for the Today (morning summary) screen.
 * Warm and bright; the night screens keep the Moonlight theme.
 */
export const day = {
  bg: '#FFE6DC',
  card: '#FFF7F3',
  plum: '#3B1631', // headings, numbers, asleep on the timeline
  text: '#4F2843',
  dim: '#6E4560',
  line: '#F6DFD6',
  coral: '#FF5A3C', // crying on the timeline
  coralSoft: '#FFB39F',
  settling: '#EAD3DD',
  feeding: '#B98AA8',
  onPlum: '#FFFFFF',
  onPlumDim: '#E8C4D6',
} as const;

export const dayFonts = {
  display: 'PlusJakartaSans_800ExtraBold',
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  bold: 'PlusJakartaSans_700Bold',
} as const;
