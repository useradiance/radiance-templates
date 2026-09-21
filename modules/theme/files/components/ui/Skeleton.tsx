import { useEffect, useRef } from 'react';
import { Animated, type ViewStyle } from 'react-native';

import { useTheme } from '@/lib/theme';

export type SkeletonProps = {
  width?: number | `${number}%` | '100%';
  height?: number;
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'pill';
  style?: ViewStyle;
};

/** Layout-faithful loading block with a light shimmer — prefer over centered spinners. */
export function Skeleton({ width = '100%', height = 16, radius = 'md', style }: SkeletonProps) {
  const theme = useTheme();
  const pulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: theme.motion.slow * 2,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: theme.motion.slow * 2,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, theme.motion.slow]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: theme.radius[radius],
          backgroundColor: theme.colors.skeleton,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}
