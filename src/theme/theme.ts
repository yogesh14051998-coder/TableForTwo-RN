export const T42 = {
  // Palette
  background: '#0D0A13',
  surface: '#191322',
  surfaceRaised: '#231A31',
  stroke: '#352947',

  gold: '#DCB85E',
  goldDeep: '#A8842F',
  purple: '#9B6CFF',
  purpleDeep: '#5B2DB3',

  textPrimary: '#F6F1E7',
  textSecondary: '#A79DB8',
  onGold: '#1A1206',
  danger: '#E5484D',
  success: '#3FBF8F',

  // Semantic
  cardRadius: 20,
  pillRadius: 50,
} as const;

export const Fonts = {
  displayLarge: { fontSize: 34, fontWeight: '700' as const, fontFamily: 'serif' },
  displayMedium: { fontSize: 26, fontWeight: '600' as const, fontFamily: 'serif' },
  displaySmall: { fontSize: 22, fontWeight: '600' as const, fontFamily: 'serif' },
  headline: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  subheadline: { fontSize: 14, fontWeight: '500' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  caption2: { fontSize: 11, fontWeight: '600' as const },
} as const;
