import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { doc } from 'firebase/firestore';

import { PersonPicker } from '@/components/PersonPicker';
import { WorkspaceMemberRow } from '@/components/WorkspaceMemberRow';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/Toast';
import { useDocument } from '@/hooks/useDocument';
import { useMemberProfiles } from '@/hooks/useMemberProfiles';
import { useResponsive } from '@/hooks/useResponsive';
import { getDb } from '@/lib/firestore';
import { createInvite } from '@/lib/invites';
import { copyToClipboard, shareText } from '@/lib/share';
import { useTheme } from '@/lib/theme';
import {
  addWorkspaceMember,
  removeWorkspaceMember,
  workspaceRole,
  type Workspace,
  type WorkspaceRole,
} from '@/lib/workspaces';
import { useAuthStore } from '@/stores/auth';

export default function WorkspaceDetail() {
  const { workspaceId } = useLocalSearchParams<{ workspaceId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const { isDesktop } = useResponsive();
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const [busy, setBusy] = useState(false);
  const [lastInviteUrl, setLastInviteUrl] = useState<string | null>(null);

  const { data, isLoading, error } = useDocument<Workspace>(
    () => doc(getDb(), 'workspaces', workspaceId),
    workspaceId && uid ? `workspace:${workspaceId}` : null,
  );

  const memberIds = useMemo(() => data?.memberIds ?? [], [data?.memberIds]);
  const { profiles, isLoading: profilesLoading } = useMemberProfiles(memberIds);

  if (!uid || isLoading) return <StateView kind="loading" />;
  if (error) return <StateView kind="error" cause={error} />;
  if (!data) return <StateView kind="empty" />;

  const canManage = workspaceRole(data, uid) === 'owner';
  const memberCount = memberIds.length || 1;

  async function inviteLink() {
    if (!workspaceId || !canManage) return;
    setBusy(true);
    try {
      const { url } = await createInvite({
        targetType: 'workspace',
        targetId: workspaceId,
      });
      setLastInviteUrl(url);
      await copyToClipboard(url);
      const outcome = await shareText(t('saas.inviteMessage', { name: data!.name }), url);
      if (outcome === 'copied' || outcome === 'shared') {
        toast(t('saas.inviteCopied'));
      }
    } catch {
      toast(t('saas.inviteFailed'), 'danger');
    } finally {
      setBusy(false);
    }
  }

  async function addPerson(person: { uid: string; displayName: string }) {
    if (!workspaceId || !canManage) return;
    if (memberIds.includes(person.uid)) {
      toast(t('saas.alreadyMember'));
      return;
    }
    setBusy(true);
    try {
      await addWorkspaceMember(workspaceId, person.uid, 'member' satisfies WorkspaceRole);
      toast(t('saas.memberAddedNamed', { name: person.displayName }));
    } catch {
      toast(t('saas.memberAddFailed'), 'danger');
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(memberId: string) {
    if (!workspaceId || !data || !canManage) return;
    setBusy(true);
    try {
      await removeWorkspaceMember(workspaceId, memberId, data.ownerId);
      toast(t('saas.memberRemoved'));
    } catch {
      toast(t('saas.memberRemoveFailed'), 'danger');
    } finally {
      setBusy(false);
    }
  }

  const membersPane = (
    <View style={{ flex: 1, gap: theme.spacing.md, width: '100%', minWidth: 0 }}>
      <SectionHeader
        title={t('saas.membersSection')}
        subtitle={t('saas.members', { count: memberCount })}
        size="section"
      />
      {profilesLoading ? <StateView kind="loading" /> : null}
      {!profilesLoading
        ? profiles.map((profile) => (
            <WorkspaceMemberRow
              key={profile.uid}
              workspace={data}
              profile={profile}
              currentUid={uid}
              canManage={canManage}
              busy={busy}
              onRemove={(memberId) => void removeMember(memberId)}
            />
          ))
        : null}
    </View>
  );

  const managePane = canManage ? (
    <View
      style={{
        flex: isDesktop ? 0.85 : undefined,
        width: isDesktop ? undefined : '100%',
        maxWidth: isDesktop ? 420 : undefined,
        gap: theme.spacing.md,
      }}
    >
      <Card>
        <View style={{ gap: theme.spacing.md }}>
          <SectionHeader
            title={t('saas.addMembers')}
            subtitle={t('saas.addMembersHint')}
            size="section"
          />
          <PersonPicker
            label={t('saas.addExisting')}
            placeholder={t('saas.pickPerson')}
            excludeIds={memberIds}
            disabled={busy}
            onSelect={(person) => void addPerson(person)}
          />
          <Button
            title={t('saas.inviteLink')}
            variant="secondary"
            onPress={() => void inviteLink()}
            loading={busy}
            fullWidth
          />
          {lastInviteUrl ? (
            <View style={{ gap: theme.spacing.xs }}>
              <TextField
                label={t('saas.inviteUrl')}
                value={lastInviteUrl}
                editable={false}
                selectTextOnFocus
              />
              <Button
                title={t('saas.copyInvite')}
                variant="ghost"
                size="sm"
                onPress={() => {
                  void copyToClipboard(lastInviteUrl).then(() => toast(t('saas.inviteCopied')));
                }}
                fullWidth
              />
            </View>
          ) : null}
        </View>
      </Card>
    </View>
  ) : null;

  return (
    <Screen scroll width="wide">
      <Stack.Screen options={{ title: data.name }} />
      <View style={{ gap: theme.spacing.xl }}>
        <View style={{ gap: theme.spacing.xs }}>
          <Text variant={isDesktop ? 'title' : 'display'}>{data.name}</Text>
          <Text variant="body" tone="muted">
            {canManage ? t('saas.roleOwner') : t('saas.roleMember')}
          </Text>
        </View>

        <View
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: 'flex-start',
            gap: theme.spacing.xl,
          }}
        >
          {membersPane}
          {managePane}
        </View>
      </View>
    </Screen>
  );
}
