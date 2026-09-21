import { LegendList, type LegendListProps, type LegendListRef } from '@legendapp/list/react-native';
import { forwardRef, type ReactElement, type ReactNode, type Ref } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useScreenConstrain, type ScreenWidth } from '@/components/ui/Screen';
import { useTheme } from '@/lib/theme';

export type ListProps<T> = LegendListProps<T> & {
  /** Extra gap between items (theme spacing token). Defaults to `md`. */
  gap?: keyof ReturnType<typeof useTheme>['spacing'];
  contentContainerStyle?: StyleProp<ViewStyle>;
  /**
   * Constrains the list column on desktop. Defaults to `full` (fill the pane).
   * Use `feed` inside FeedLayout, `wide` for a capped catalog, `form` for settings.
   */
  width?: ScreenWidth;
};

/**
 * Themed virtualized list backed by `@legendapp/list`.
 * Prefer this over raw FlatList for feeds, carts, and project lists.
 */
function ListInner<T>(
  {
    gap = 'md',
    contentContainerStyle,
    style,
    recycleItems = true,
    width = 'full',
    ...rest
  }: ListProps<T>,
  ref: Ref<LegendListRef>,
) {
  const theme = useTheme();
  const constrain = useScreenConstrain(width);

  return (
    <LegendList
      ref={ref}
      recycleItems={recycleItems}
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[
        {
          gap: theme.spacing[gap],
          flexGrow: 1,
          ...(constrain ?? {}),
        },
        contentContainerStyle,
      ]}
      {...rest}
    />
  );
}

export const List = forwardRef(ListInner) as <T>(
  props: ListProps<T> & { ref?: Ref<LegendListRef> },
) => ReactElement | null;

/** Simple column wrapper when you need a non-list stack with the same gap token. */
export function ListStack({
  children,
  gap = 'md',
  style,
}: {
  children: ReactNode;
  gap?: keyof ReturnType<typeof useTheme>['spacing'];
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  return <View style={[{ gap: theme.spacing[gap] }, style]}>{children}</View>;
}
