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
  display: 'BricolageGrotesque_800ExtraBold',
  regular: 'DMSans_400Regular',
  medium: 'DMSans_500Medium',
  bold: 'DMSans_700Bold',
} as const;
