import { Image, View, type ImageStyle, type StyleProp } from 'react-native';

import { useTheme } from '@/lib/theme';

export type MediaImageProps = {
  uri?: string | null;
  aspectRatio?: number;
  radius?: 'sm' | 'md' | 'lg' | 'xl' | 'none';
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
};

/** Shared image with token radius, skeleton fallback, and a stable aspect ratio. */
export function MediaImage({
  uri,
  aspectRatio = 4 / 3,
  radius = 'lg',
  style,
  accessibilityLabel,
}: MediaImageProps) {
  const theme = useTheme();
  const borderRadius = radius === 'none' ? 0 : theme.radius[radius];

  return (
    <View
      style={{
        width: '100%',
        aspectRatio,
        borderRadius,
        overflow: 'hidden',
        backgroundColor: theme.colors.skeleton,
      }}
    >
      {uri ? (
        <Image
          source={{ uri }}
          accessibilityLabel={accessibilityLabel}
          resizeMode="cover"
          style={[{ width: '100%', height: '100%' }, style]}
        />
      ) : null}
    </View>
  );
}
