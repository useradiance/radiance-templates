import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
  useFonts as useDmSans,
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  useFonts as useFraunces,
} from '@expo-google-fonts/fraunces';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import {
  StyleSheet,
  useColorScheme,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { getActivePack } from '@/lib/theme/config';
import {
  breakpoints,
  buildElevation,
  defaultFonts,
  motion,
  radius,
  responsiveSpace,
  spacing,
  typography,
  type ColorScheme,
  type Theme,
} from '@/lib/theme/tokens';
import { useAppearanceStore } from '@/stores/appearance';

function buildTheme(scheme: ColorScheme): Theme {
  const pack = getActivePack();
  return {
    scheme,
    pack: pack.id,
    colors: scheme === 'dark' ? pack.dark : pack.light,
    fonts: { ...defaultFonts, ...pack.fonts },
    spacing,
    radius,
    typography,
    motion,
    breakpoints,
    responsiveSpace,
    elevation: buildElevation(scheme),
  };
}

const ThemeContext = createContext<Theme>(buildTheme('light'));

/** Theme context without UI chrome — import this from Text/Toast so the barrel can mount ToastHost. */
export function ThemeRoot({ children }: { children: ReactNode }) {
  const preference = useAppearanceStore((state) => state.preference);
  const systemScheme = useColorScheme();
  const scheme: ColorScheme =
    preference === 'system' ? ((systemScheme ?? 'light') as ColorScheme) : preference;

  const theme = useMemo(() => buildTheme(scheme), [scheme]);
  const [dmLoaded, dmError] = useDmSans({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  const [frauncesLoaded, frauncesError] = useFraunces({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });

  const ready = (dmLoaded && frauncesLoaded) || Boolean(dmError || frauncesError);

  return <ThemeContext.Provider value={theme}>{ready ? children : null}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

type NamedStyles = Record<string, ViewStyle | TextStyle | ImageStyle>;

/**
 * Builds a theme-aware stylesheet hook.
 *
 * ```ts
 * const useStyles = createStyles((theme) => ({
 *   card: { backgroundColor: theme.colors.surface, padding: theme.spacing.lg },
 * }));
 * ```
 */
export function createStyles<T extends NamedStyles>(factory: (theme: Theme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
