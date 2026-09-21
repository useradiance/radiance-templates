import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { WorkspaceCard } from '@/components/WorkspaceCard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { TextField } from '@/components/ui/TextField';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { withDemoFallback } from '@/lib/demo-fallback';
import { demoWorkspaces } from '@/lib/demo-content';
import { createWorkspace, workspacesQuery, type Workspace } from '@/lib/workspaces';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

function WorkspacesSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} height={72} radius="lg" />
      ))}
    </View>
  );
}

function CreateWorkspaceCard({
  name,
  setName,
  onCreate,
}: {
  name: string;
  setName: (value: string) => void;
  onCreate: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Card>
      <View style={{ gap: theme.spacing.md }}>
        <TextField
          label={t('saas.newWorkspace')}
          value={name}
          onChangeText={setName}
          onSubmitEditing={onCreate}
          returnKeyType="done"
        />
        <Button title={t('saas.create')} onPress={onCreate} disabled={!name.trim()} fullWidth />
      </View>
    </Card>
  );
}

function WorkspaceHome() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop, containerPadding } = useResponsive();
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const [name, setName] = useState('');
  const { data: live, isLoading } = useCollection<Workspace>(
    () => workspacesQuery(uid!),
    uid ? `workspaces:${uid}` : null,
  );
  const data = withDemoFallback(live, demoWorkspaces(uid ?? 'preview'));

  const create = async () => {
    if (!uid || !name.trim()) return;
    const value = name;
    setName('');
    await createWorkspace(value, uid);
  };

  const header = (
    <View style={{ gap: theme.spacing.lg, marginBottom: theme.spacing.sm }}>
      <SectionHeader title={t('saas.workspace')} subtitle={t('saas.workspaceSubtitle')} />
      {!isDesktop ? (
        <CreateWorkspaceCard name={name} setName={setName} onCreate={() => void create()} />
      ) : null}
    </View>
  );

  const list = (
    <List
      data={data}
      keyExtractor={(w) => w.id}
      gap="md"
      width="full"
      contentContainerStyle={{ padding: isDesktop ? theme.spacing.lg : containerPadding }}
      ListHeaderComponent={isDesktop ? null : header}
      ListEmptyComponent={
        isLoading ? (
          <WorkspacesSkeleton />
        ) : (
          <StateView
            kind="empty"
            title={t('saas.emptyTitle')}
            description={t('saas.emptyDescription')}
          />
        )
      }
      renderItem={({ item }) => (
        <WorkspaceCard
          workspace={item}
          membersLabel={t('saas.members', { count: item.memberIds?.length ?? 1 })}
          onPress={() => router.push(`/workspace/${item.id}`)}
        />
      )}
    />
  );

  if (isDesktop) {
    return (
      <Screen padded={false} width="wide">
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'stretch' }}>
          <View
            style={{
              width: 360,
              padding: theme.spacing.lg,
              gap: theme.spacing.lg,
              borderRightWidth: 1,
              borderRightColor: theme.colors.border,
            }}
          >
            <SectionHeader title={t('saas.workspace')} subtitle={t('saas.workspaceSubtitle')} />
            <CreateWorkspaceCard name={name} setName={setName} onCreate={() => void create()} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>{list}</View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false} width="wide">
      {list}
    </Screen>
  );
}

export default function SaaSHome() {
  return <WorkspaceHome />;
}
