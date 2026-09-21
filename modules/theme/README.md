# theme module

Design tokens, light/dark theming, Fraunces + DM Sans pairing, and the UI primitives every Radiance screen is built from.

## What it adds

- `lib/theme/tokens.ts` — spacing, radius, typography, fonts, motion and colour token types
- `lib/theme/packs/*` — `neutral`, `contrast`, `branded`, `ocean`, `ink`, `hearth`, `bloom`, `flare`, `paper`, `grove`, `violet`, `citrus` (and optional `custom`)
- `lib/theme/index.tsx` — `ThemeProvider`, `useTheme()`, `createStyles()`
- `lib/haptics.ts` — `haptic()` (no-op on web)
- `stores/appearance.ts` — persisted light / dark / system preference
- `components/ui/*` — Text, Button, TextField, Screen, ListRow, StateView, Skeleton, Avatar,
  IconButton, SectionHeader, Card, List, Grid, DataTable, Slider, SwitchRow, CheckboxRow, Progress, Chip,
  AppHeader, SplitView, FeedLayout, CatalogLayout, ChipRow, MapListSplit, ReaderLayout, MediaDetail,
  PageDots, Onboarding, Dialog, Sheet, Select, Toast (`toast()`), Badge, Divider, MediaImage,
  Segmented, Fab, AppNav (`SidebarNav`, `TopNav`)

## Usage

```tsx
import { createStyles } from '@/lib/theme';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { List } from '@/components/ui/List';
import { toast } from '@/components/ui/Toast';

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
}));

export default function Example() {
  const styles = useStyles();
  return (
    <Screen>
      <Text variant="title">Hello</Text>
    </Screen>
  );
}
```

Prefer `List` / `Grid` (Legend List) over raw `FlatList`. Prefer `DataTable` for admin/resource
lists (aligned columns on desktop, stacked rows on phone). `DataTable` includes a freeform `q`
search, optional `filterable` columns (Add filter), and drag handles to resize columns and row
height. `SplitView` accepts `collapsible` to hide the detail pane. Use `Skeleton` for layout-faithful loading.
Use `MediaImage` instead of raw `Image`. Use `Dialog` / `Sheet` / `toast()` instead of `Alert`. `Sheet` is a bottom sheet on phone and a popup menu on desktop.

## Rules

- Never hard-code a colour, radius, spacing value or font size in a screen or component —
  read it from `useTheme()` or `createStyles`.
- Inside app chrome, `Screen` / `List` / `Grid` default to the full pane. Use `FeedLayout`, `ReaderLayout`, `width="form"`, or `align="center"` when you need a column.
- New palettes go in `lib/theme/packs/` and are registered in `lib/theme/config.ts`.
- Switching the active pack is a one-line change to `ACTIVE_PACK`.
