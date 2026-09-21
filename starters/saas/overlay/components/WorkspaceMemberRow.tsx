import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Dialog } from '@/components/ui/Dialog';
import { IconButton } from '@/components/ui/IconButton';
import { ListRow } from '@/components/ui/ListRow';
import { Select } from '@/components/ui/Select';
import type { MemberProfile } from '@/hooks/useMemberProfiles';
import { useTheme } from '@/lib/theme';
import {
  setWorkspaceMemberRole,
  workspaceRole,
  type Workspace,
  type WorkspaceRole,
} from '@/lib/workspaces';

type Props = {
  workspace: Workspace;
  profile: MemberProfile;
  currentUid: string;
  canManage: boolean;
  onRemove: (memberId: string) => void;
  busy?: boolean;
};

export function WorkspaceMemberRow({
  workspace,
  profile,
  currentUid,
  canManage,
  onRemove,
  busy,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [confirmRemove, setConfirmRemove] = useState(false);
  const role = workspaceRole(workspace, profile.uid);
  const isOwner = role === 'owner';
  const isYou = profile.uid === currentUid;
  const seatRole: WorkspaceRole = role === 'owner' ? 'member' : role;

  const roleLabel =
    role === 'owner'
      ? t('saas.seatOwner')
      : role === 'admin'
        ? t('saas.seatAdmin')
        : t('saas.seatMember');

  const subtitle =
    [isYou ? t('saas.you') : null, profile.email].filter(Boolean).join(' · ') || undefined;

  return (
    <>
      <ListRow
        title={profile.displayName}
        subtitle={subtitle}
        leading={<Avatar name={profile.displayName} uri={profile.photoURL} size="sm" />}
        trailing={
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
              maxWidth: 220,
            }}
          >
            {isOwner || !canManage ? (
              <Badge label={roleLabel} tone={isOwner ? 'primary' : 'default'} />
            ) : (
              <View style={{ minWidth: 120 }}>
                <Select
                  value={seatRole}
                  options={[
                    { value: 'admin', label: t('saas.seatAdmin') },
                    { value: 'member', label: t('saas.seatMember') },
                  ]}
                  onChange={(value) => {
                    void setWorkspaceMemberRole(workspace.id, profile.uid, value as WorkspaceRole);
                  }}
                />
              </View>
            )}
            {canManage && !isOwner ? (
              <IconButton
                name="person-remove-outline"
                accessibilityLabel={t('saas.removeMember')}
                size="sm"
                disabled={busy}
                onPress={() => setConfirmRemove(true)}
              />
            ) : null}
          </View>
        }
      />
      <Dialog
        visible={confirmRemove}
        title={t('saas.removeMemberTitle')}
        description={t('saas.removeMemberHint', { name: profile.displayName })}
        onClose={() => setConfirmRemove(false)}
        actions={[
          {
            title: t('saas.cancel'),
            variant: 'ghost',
            onPress: () => setConfirmRemove(false),
          },
          {
            title: t('saas.removeMember'),
            variant: 'danger',
            onPress: () => {
              setConfirmRemove(false);
              onRemove(profile.uid);
            },
          },
        ]}
      />
    </>
  );
}
