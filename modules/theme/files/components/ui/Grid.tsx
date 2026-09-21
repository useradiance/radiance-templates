import type { LegendListProps, LegendListRef } from '@legendapp/list/react-native';
import { forwardRef, type ReactElement, type Ref } from 'react';

import { List, type ListProps } from '@/components/ui/List';
import { useTheme } from '@/lib/theme';

type ColumnWrapperStyle = NonNullable<LegendListProps<unknown>['columnWrapperStyle']>;

export type GridProps<T> = Omit<ListProps<T>, 'numColumns' | 'columnWrapperStyle'> & {
  numColumns: number;
  /** Gap between columns (and default row gap via List). Defaults to `md`. */
  gap?: keyof ReturnType<typeof useTheme>['spacing'];
  columnWrapperStyle?: ColumnWrapperStyle;
};

/**
 * Multi-column list for catalogs and galleries.
 * Uses the same LegendList engine as `List`. Rendered items should use `flex: 1`.
 */
function GridInner<T>(
  { numColumns, gap = 'md', columnWrapperStyle, width = 'full', ...rest }: GridProps<T>,
  ref: Ref<LegendListRef>,
) {
  const theme = useTheme();
  const gutter = theme.spacing[gap];

  const wrapper: ColumnWrapperStyle | undefined =
    numColumns > 1
      ? ({ gap: gutter, ...(columnWrapperStyle ?? {}) } as ColumnWrapperStyle)
      : columnWrapperStyle;

  return (
    <List
      ref={ref}
      gap={gap}
      numColumns={numColumns}
      columnWrapperStyle={wrapper}
      width={width}
      {...rest}
    />
  );
}

export const Grid = forwardRef(GridInner) as <T>(
  props: GridProps<T> & { ref?: Ref<LegendListRef> },
) => ReactElement | null;
