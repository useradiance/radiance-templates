import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { List } from '@/components/ui/List';
import { ListRow } from '@/components/ui/ListRow';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Select } from '@/components/ui/Select';
import { StateView } from '@/components/ui/StateView';
import { toast } from '@/components/ui/Toast';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { setUserRole } from '@/lib/roles';
import { useTheme } from '@/lib/theme';
import { usersQuery, type AppUser } from '@/lib/users';
import { useAuthStore } from '@/stores/auth';

const ROLE_OPTIONS = [
  { value: 'admin', labelKey: 'admin.roleAdmin' },
  { value: 'member', labelKey: 'admin.roleMember' },
  { value: '', labelKey: 'admin.roleNone' },
] as const;

type Props = {
  /** When true, show role selects (caller must already be an admin). */
  canManageRoles?: boolean;
  title?: string;
  subtitle?: string;
};

export function UsersAdminList({ canManageRoles = false, title, subtitle }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { containerPadding } = useResponsive();
  const currentUid = useAuthStore((s) => s.user?.uid ?? null);
  const [busyUid, setBusyUid] = useState<string | null>(null);
  const { data, isLoading, error } = useCollection<AppUser>(() => usersQuery(), 'admin-users');
  const sorted = [...data].sort((a, b) => {
    const left = (a.displayName || a.email || a.uid || a.id || '').toLowerCase();
    const right = (b.displayName || b.email || b.uid || b.id || '').toLowerCase();
    return left.localeCompare(right);
  });

  async function changeRole(uid: string, value: string) {
    setBusyUid(uid);
    try {
      await setUserRole(uid, value === '' ? null : value);
      toast(t('admin.roleUpdated'), 'success');
    } catch {
      toast(t('admin.roleUpdateFailed'), 'danger');
    } finally {
      setBusyUid(null);
    }
  }

  if (error) return <StateView kind="error" cause={error} />;

  return (
    <List
      data={sorted}
      keyExtractor={(user) => user.uid || user.id}
      gap="md"
      width="full"
      contentContainerStyle={{ padding: containerPadding, flexGrow: 1 }}
      ListHeaderComponent={
        <View style={{ marginBottom: theme.spacing.md }}>
          <SectionHeader
            title={title ?? t('admin.usersTitle')}
            subtitle={subtitle ?? t('admin.usersSubtitle')}
          />
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <StateView kind="loading" />
        ) : (
          <StateView
            kind="empty"
            title={t('admin.usersEmpty')}
            description={t('admin.usersEmptyHint')}
          />
        )
      }
      renderItem={({ item }) => {
        const uid = item.uid || item.id;
        const name = item.displayName || item.email || uid.slice(0, 8);
        const role = item.role ?? '';
        const isYou = uid === currentUid;
        return (
          <ListRow
            title={name}
            subtitle={
              [isYou ? t('admin.you') : null, item.email].filter(Boolean).join(' · ') || undefined
            }
            leading={<Avatar name={name} uri={item.photoURL} size="sm" />}
            trailing={
              canManageRoles ? (
                <View style={{ minWidth: 140, opacity: busyUid === uid ? 0.5 : 1 }}>
                  <Select
                    value={role}
                    options={ROLE_OPTIONS.map((option) => ({
                      value: option.value,
                      label: t(option.labelKey),
                    }))}
                    onChange={(value) => void changeRole(uid, value)}
                  />
                </View>
              ) : role ? (
                <Badge
                  label={role === 'admin' ? t('admin.roleAdmin') : t('admin.roleMember')}
                  tone={role === 'admin' ? 'primary' : 'default'}
                />
              ) : null
            }
          />
        );
      }}
    />
  );
}
