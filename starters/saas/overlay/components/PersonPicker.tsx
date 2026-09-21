import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useCollection } from '@/hooks/useCollection';
import { useTheme } from '@/lib/theme';
import { usersQuery, type AppUser } from '@/lib/users';

export type PersonPickerProps = {
  label?: string;
  placeholder?: string;
  /** Uids already in the workspace (or otherwise unavailable). */
  excludeIds?: string[];
  disabled?: boolean;
  onSelect: (person: { uid: string; displayName: string }) => void;
};

function labelFor(user: AppUser): string {
  return user.displayName || user.email || user.uid || user.id;
}

/**
 * Inline autocomplete over `users` profiles — type to filter, pick from the dropdown.
 */
export function PersonPicker({
  label,
  placeholder,
  excludeIds = [],
  disabled,
  onSelect,
}: PersonPickerProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const { data, isLoading } = useCollection<AppUser>(() => usersQuery(), 'person-picker');

  const excluded = useMemo(() => new Set(excludeIds), [excludeIds]);

  const options = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data
      .filter((user) => {
        const uid = user.uid || user.id;
        if (!uid || excluded.has(uid)) return false;
        if (!needle) return true;
        const hay = `${user.displayName ?? ''} ${user.email ?? ''} ${uid}`.toLowerCase();
        return hay.includes(needle);
      })
      .sort((a, b) => labelFor(a).localeCompare(labelFor(b)))
      .slice(0, 40);
  }, [data, excluded, query]);

  const showDropdown = focused && !disabled;

  return (
    <View style={{ gap: theme.spacing.xs, alignSelf: 'stretch', zIndex: showDropdown ? 20 : 0 }}>
      <TextField
        label={label}
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder ?? t('saas.pickPerson')}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          // Defer so option press can fire before the list unmounts.
          setTimeout(() => setFocused(false), 150);
        }}
      />

      {showDropdown ? (
        <View
          style={{
            marginTop: -theme.spacing.xs,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            backgroundColor: theme.colors.surface,
            maxHeight: 280,
            overflow: 'hidden',
            ...theme.elevation.medium,
          }}
        >
          <ScrollView keyboardShouldPersistTaps="handled" nestedScrollEnabled>
            {isLoading ? (
              <View style={{ padding: theme.spacing.lg }}>
                <Text variant="body" tone="muted">
                  {t('saas.loadingPeople')}
                </Text>
              </View>
            ) : null}
            {!isLoading && options.length === 0 ? (
              <View style={{ padding: theme.spacing.lg }}>
                <Text variant="body" tone="muted">
                  {t('saas.noPeopleMatch')}
                </Text>
              </View>
            ) : null}
            {options.map((user) => {
              const uid = user.uid || user.id;
              const name = labelFor(user);
              return (
                <Pressable
                  key={uid}
                  onPress={() => {
                    onSelect({ uid, displayName: name });
                    setQuery('');
                    setFocused(false);
                  }}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: theme.spacing.md,
                    paddingVertical: theme.spacing.md,
                    paddingHorizontal: theme.spacing.lg,
                    backgroundColor: pressed ? theme.colors.surfaceMuted : 'transparent',
                  })}
                >
                  <Avatar name={name} uri={user.photoURL} size="sm" />
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="body" weight="semibold">
                      {name}
                    </Text>
                    {user.email ? (
                      <Text variant="caption" tone="muted">
                        {user.email}
                      </Text>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}
