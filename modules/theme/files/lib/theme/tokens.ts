import { Platform, type ViewStyle } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textInverted: string;
  primary: string;
  primaryHover: string;
  primaryText: string;
  secondary: string;
  secondaryText: string;
  success: string;
  warning: string;
  danger: string;
  dangerText: string;
  overlay: string;
  skeleton: string;
};

export type ThemeFonts = {
  display: string;
  body: string;
  bodyMedium: string;
  bodySemibold: string;
};

/** Loaded by ThemeProvider via expo-font. Packs may override display. */
export const defaultFonts: ThemeFonts = {
  display: 'Fraunces_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemibold: 'DMSans_600SemiBold',
};

export type ThemePack = {
  id: string;
  label: string;
  /** Short hint shown in init / pack pickers. */
  description?: string;
  light: ThemeColors;
  dark: ThemeColors;
  fonts?: Partial<ThemeFonts>;
};

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

export const typography = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 26,
    xxl: 34,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 34,
    xxl: 42,
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  /** Tracking for display / title hierarchy — keep body at 0. */
  letterSpacing: {
    display: -0.6,
    title: -0.3,
    subtitle: -0.2,
    body: 0,
    label: 0.2,
    caption: 0.1,
  },
} as const;

export const motion = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;

export const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

export type Breakpoint = keyof typeof breakpoints;

export const responsiveSpace = {
  container: { xs: 12, sm: 16, md: 20, lg: 24 },
  section: { xs: 16, sm: 20, md: 24, lg: 32 },
  card: { xs: 12, sm: 16, md: 20, lg: 24 },
  touch: { xs: 44, sm: 48, md: 52, lg: 56 },
} as const;

export type Elevation = ViewStyle;

export type Theme = {
  scheme: ColorScheme;
  pack: string;
  colors: ThemeColors;
  fonts: ThemeFonts;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  motion: typeof motion;
  breakpoints: typeof breakpoints;
  responsiveSpace: typeof responsiveSpace;
  elevation: {
    none: Elevation;
    low: Elevation;
    medium: Elevation;
  };
};

function hexToRgba(hex: string, opacity: number): string {
  const raw = hex.replace('#', '');
  const full = raw.length === 3 ? [...raw].map((c) => `${c}${c}`).join('') : raw;
  const n = Number.parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function elevationStyle(
  color: string,
  opacity: number,
  radius: number,
  height: number,
  androidElevation: number,
): Elevation {
  if (Platform.OS === 'web') {
    return {
      boxShadow:
        opacity === 0 ? 'none' : `0px ${height}px ${radius}px ${hexToRgba(color, opacity)}`,
    };
  }
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height },
    elevation: androidElevation,
  };
}

export function buildElevation(scheme: ColorScheme): Theme['elevation'] {
  const shadowColor = scheme === 'dark' ? '#000000' : '#0f172a';
  return {
    none: elevationStyle(shadowColor, 0, 0, 0, 0),
    low: elevationStyle(shadowColor, scheme === 'dark' ? 0.35 : 0.06, 8, 2, 2),
    medium: elevationStyle(shadowColor, scheme === 'dark' ? 0.45 : 0.1, 18, 6, 5),
  };
}
