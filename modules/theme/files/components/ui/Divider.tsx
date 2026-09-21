import { View, type ViewStyle } from 'react-native';

import { useTheme } from '@/lib/theme';

export type DividerProps = {
  style?: ViewStyle;
};

/** Hairline separator between stacked content. */
export function Divider({ style }: DividerProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          height: 1,
          alignSelf: 'stretch',
          backgroundColor: theme.colors.border,
        },
        style,
      ]}
    />
  );
}
