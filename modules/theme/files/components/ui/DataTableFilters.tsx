import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Sheet, type SheetAnchor } from '@/components/ui/Sheet';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { isInactiveFilterValue, type DataTableFilterDef } from '@/lib/table-filter';
import { useTheme } from '@/lib/theme';

export type DataTableFiltersProps<T> = {
  filters: DataTableFilterDef<T>[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
};

/**
 * FilterForm analogue: always-on inputs stay visible; the rest sit behind Add filter
 * the way react-admin hides optional `<TextInput>`s until you pick them.
 */
export function DataTableFilters<T>({ filters, values, onChange }: DataTableFiltersProps<T>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const addFilterRef = useRef<View>(null);
  const [added, setAdded] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [anchor, setAnchor] = useState<SheetAnchor | null>(null);

  const visible = useMemo(() => {
    const extra = new Set(added);
    return filters.filter((filter) => {
      if (filter.alwaysOn) return true;
      if (extra.has(filter.source)) return true;
      return !isInactiveFilterValue(values[filter.source]);
    });
  }, [added, filters, values]);

  const visibleSources = useMemo(() => new Set(visible.map((filter) => filter.source)), [visible]);
  const hidden = filters.filter((filter) => !filter.alwaysOn && !visibleSources.has(filter.source));

  function setValue(source: string, value: string) {
    onChange({ ...values, [source]: value });
  }

  function removeFilter(source: string) {
    const next = { ...values };
    delete next[source];
    onChange(next);
    setAdded((current) => current.filter((id) => id !== source));
  }

  function openPicker() {
    const node = addFilterRef.current;
    if (!node) {
      setAnchor(null);
      setPickerOpen(true);
      return;
    }
    node.measureInWindow((x, y, width, height) => {
      setAnchor(width || height ? { x, y, width, height } : null);
      setPickerOpen(true);
    });
  }

  if (filters.length === 0) return null;

  return (
    <View
      style={{
        gap: theme.spacing.sm,
        paddingBottom: theme.spacing.md,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: theme.spacing.sm,
          alignItems: 'flex-end',
        }}
      >
        {visible.map((filter) => {
          if (filter.choices && filter.choices.length > 0) {
            const selected = values[filter.source] ?? filter.choices[0]?.id ?? '';
            return (
              <View key={filter.source} style={{ gap: theme.spacing.xs, flexGrow: 1 }}>
                {filter.label ? (
                  <Text variant="label" tone="muted">
                    {filter.label}
                  </Text>
                ) : null}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm }}>
                  {filter.choices.map((choice) => (
                    <Chip
                      key={choice.id}
                      label={choice.name}
                      selected={selected === choice.id}
                      onPress={() => setValue(filter.source, choice.id)}
                    />
                  ))}
                </View>
              </View>
            );
          }

          const isQuery = filter.source === 'q';
          return (
            <View
              key={filter.source}
              style={{
                flexGrow: 1,
                flexBasis: isQuery ? 220 : 160,
                minWidth: isQuery ? 180 : 140,
                flexDirection: 'row',
                alignItems: 'flex-end',
                gap: theme.spacing.xs,
              }}
            >
              <View style={{ flex: 1 }}>
                <TextField
                  label={isQuery ? undefined : filter.label}
                  value={values[filter.source] ?? ''}
                  onChangeText={(value) => setValue(filter.source, value)}
                  placeholder={filter.placeholder ?? (isQuery ? t('table.search') : filter.label)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  clearButtonMode="while-editing"
                  accessibilityLabel={filter.label ?? t('table.search')}
                />
              </View>
              {filter.alwaysOn ? null : (
                <IconButton
                  name="close"
                  size="sm"
                  accessibilityLabel={t('table.removeFilter')}
                  onPress={() => removeFilter(filter.source)}
                />
              )}
            </View>
          );
        })}
        {hidden.length > 0 ? (
          <View ref={addFilterRef} collapsable={false}>
            <Button title={t('table.addFilter')} size="sm" variant="ghost" onPress={openPicker} />
          </View>
        ) : null}
      </View>
      <Sheet
        visible={pickerOpen}
        title={t('table.addFilter')}
        anchor={anchor}
        onClose={() => setPickerOpen(false)}
      >
        {hidden.map((filter) => (
          <Pressable
            key={filter.source}
            accessibilityRole="button"
            onPress={() => {
              setAdded((current) =>
                current.includes(filter.source) ? current : [...current, filter.source],
              );
              if (filter.choices?.[0]) {
                setValue(filter.source, filter.choices[0].id);
              } else if (isInactiveFilterValue(values[filter.source])) {
                setValue(filter.source, '');
              }
              setPickerOpen(false);
            }}
            style={({ pressed }) => ({
              paddingVertical: theme.spacing.md,
              paddingHorizontal: theme.spacing.sm,
              borderRadius: theme.radius.md,
              backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
            })}
          >
            <Text variant="body">{filter.label ?? filter.source}</Text>
          </Pressable>
        ))}
      </Sheet>
    </View>
  );
}
