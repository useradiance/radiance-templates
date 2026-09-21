import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { SearchField } from '@/components/SearchField';
import { Card } from '@/components/ui/Card';
import { Text } from '@/components/ui/Text';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import {
  searchSources,
  type GroupedHits,
  type SearchHit,
  type SearchSource,
} from '@/lib/search-sources';
import { useTheme } from '@/lib/theme';

type Props = {
  sources: SearchSource[];
  placeholder?: string;
  debounceMs?: number;
  onSelect: (hit: SearchHit, sourceId: string) => void;
};

/**
 * Debounced search field with a dropdown of grouped hits.
 * Sources can be local lists, cached wrappers, Firestore prefix queries, or remote APIs.
 */
export function SearchAutocomplete({ sources, placeholder, debounceMs = 250, onSelect }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [term, setTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<GroupedHits[]>([]);
  const debounced = useDebouncedValue(term, debounceMs);
  const sourceKey = useMemo(() => sources.map((source) => source.id).join(','), [sources]);

  useEffect(() => {
    let cancelled = false;
    if (debounced.trim().length < 2) {
      setGroups([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void searchSources(sources, debounced).then((next) => {
      if (cancelled) return;
      setGroups(next);
      setLoading(false);
      setOpen(true);
    });
    return () => {
      cancelled = true;
    };
    // sourceKey stands in for the sources array identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, sourceKey]);

  const empty = !loading && debounced.trim().length >= 2 && groups.length === 0 && open;

  return (
    <View style={{ zIndex: 20 }}>
      <SearchField
        value={term}
        onChangeText={(value) => {
          setTerm(value);
          setOpen(true);
        }}
        placeholder={placeholder}
      />
      {open && (loading || empty || groups.length > 0) ? (
        <Card style={{ marginTop: theme.spacing.sm, gap: theme.spacing.sm }}>
          {loading ? (
            <View style={{ paddingVertical: theme.spacing.sm, alignItems: 'center' }}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          ) : null}
          {empty ? (
            <Text variant="caption" tone="muted">
              {t('search.empty')}
            </Text>
          ) : null}
          {groups.map((group) => (
            <View key={group.sourceId} style={{ gap: theme.spacing.xs }}>
              {group.label ? (
                <Text variant="caption" tone="muted">
                  {group.label}
                </Text>
              ) : null}
              {group.hits.map((hit) => (
                <Pressable
                  key={`${group.sourceId}:${hit.id}`}
                  accessibilityRole="button"
                  onPress={() => {
                    onSelect(hit, group.sourceId);
                    setTerm(hit.title);
                    setOpen(false);
                  }}
                  style={({ pressed }) => ({
                    paddingVertical: theme.spacing.sm,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text variant="label" weight="semibold" numberOfLines={1}>
                    {hit.title}
                  </Text>
                  {hit.subtitle ? (
                    <Text variant="caption" tone="muted" numberOfLines={1}>
                      {hit.subtitle}
                    </Text>
                  ) : null}
                </Pressable>
              ))}
            </View>
          ))}
        </Card>
      ) : null}
    </View>
  );
}
