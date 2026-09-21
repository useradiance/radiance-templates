import { useWindowDimensions } from 'react-native';

import { breakpoints, responsiveSpace, type Breakpoint } from '@/lib/theme/tokens';

const ORDER: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];

export function breakpointForWidth(width: number): Breakpoint {
  let current: Breakpoint = 'xs';
  for (const name of ORDER) {
    if (width >= breakpoints[name]) current = name;
  }
  return current;
}

function pickResponsive<T extends Record<string, number>>(scale: T, bp: Breakpoint): number {
  const keys = Object.keys(scale) as (keyof T)[];
  let value = scale[keys[0]] as number;
  for (const key of keys) {
    if (breakpoints[key as Breakpoint] <= breakpoints[bp]) {
      value = scale[key] as number;
    }
  }
  return value;
}

/**
 * Viewport-aware breakpoint and spacing helpers.
 * Desktop chrome (sidebar) kicks in at `lg` (≥992) so laptops get the web layout.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const breakpoint = breakpointForWidth(width);
  const isPhone = breakpoint === 'xs' || breakpoint === 'sm';
  const isTablet = breakpoint === 'md';
  const isDesktop = breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === 'xxl';

  return {
    width,
    height,
    breakpoint,
    isPhone,
    isTablet,
    isDesktop,
    containerPadding: pickResponsive(responsiveSpace.container, breakpoint),
    sectionSpacing: pickResponsive(responsiveSpace.section, breakpoint),
    cardPadding: pickResponsive(responsiveSpace.card, breakpoint),
    touchTarget: pickResponsive(responsiveSpace.touch, breakpoint),
  };
}

export type ColumnSpec = {
  sm?: number;
  md?: number;
  lg?: number;
};

/** Catalog column count: 2 on phone, 3 on tablet, 4 on desktop unless overridden. */
export function useResponsiveColumns(spec: ColumnSpec = {}): number {
  const { isDesktop, isTablet } = useResponsive();
  const sm = spec.sm ?? 2;
  const md = spec.md ?? 3;
  const lg = spec.lg ?? 4;
  if (isDesktop) return lg;
  if (isTablet) return md;
  return sm;
}
