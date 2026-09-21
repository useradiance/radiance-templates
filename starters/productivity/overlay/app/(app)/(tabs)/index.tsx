import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ProjectCard } from '@/components/ProjectCard';
import { CommentsSection } from '@/components/CommentsSection';
import { SyncBanner } from '@/components/SyncBanner';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { CheckboxRow } from '@/components/ui/CheckboxRow';
import { Dialog } from '@/components/ui/Dialog';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { Skeleton } from '@/components/ui/Skeleton';
import { SplitView } from '@/components/ui/SplitView';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { DEMO_PROJECTS, DEMO_TASKS } from '@/lib/demo-content';
import { withDemoFallback } from '@/lib/demo-fallback';
import {
  createProject,
  deleteProject,
  projectsQuery,
  setTaskDone,
  tasksQuery,
  type Project,
  type Task,
} from '@/lib/projects';
import { createInvite } from '@/lib/invites';
import { shareText } from '@/lib/share';
import { toast } from '@/components/ui/Toast';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

function ProjectsSkeleton() {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing.md }}>
      {[0, 1, 2].map((key) => (
        <Skeleton key={key} height={64} radius="lg" />
      ))}
    </View>
  );
}

export default function ProjectsScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop, containerPadding } = useResponsive();
  const uid = useAuthStore((state) => state.user?.uid ?? null);
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);

  const { data: live, isLoading } = useCollection<Project>(
    () => projectsQuery(uid!),
    uid ? `projects:${uid}` : null,
  );
  const projects = withDemoFallback(live, DEMO_PROJECTS);
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0];

  const { data: liveTasks, isLoading: tasksLoading } = useCollection<Task>(
    () => tasksQuery(selected?.id ?? ''),
    selected && uid ? `tasks:${selected.id}` : null,
  );
  const tasks = withDemoFallback(liveTasks, selected ? (DEMO_TASKS[selected.id] ?? []) : []);
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0];

  const add = async () => {
    if (!uid || name.trim().length === 0) return;
    const value = name;
    setName('');
    setOpen(false);
    await createProject(uid, value);
  };

  const master = (
    <List
      data={projects}
      keyExtractor={(project) => project.id}
      gap="md"
      width="full"
      contentContainerStyle={{ padding: containerPadding }}
      ListHeaderComponent={
        <AppHeader
          title={t('projects.title')}
          subtitle={t('projects.subtitle')}
          trailing={<Button title={t('projects.create')} size="sm" onPress={() => setOpen(true)} />}
        />
      }
      ListEmptyComponent={
        isLoading ? (
          <ProjectsSkeleton />
        ) : (
          <StateView
            kind="empty"
            title={t('projects.emptyTitle')}
            description={t('projects.emptyDescription')}
          />
        )
      }
      renderItem={({ item }) => (
        <ProjectCard
          project={item}
          tasksLabel={t('projects.openTasks', { count: item.openTaskCount ?? 0 })}
          onPress={() => {
            if (isDesktop) setSelectedId(item.id);
            else router.push(`/project/${item.id}`);
          }}
        />
      )}
    />
  );

  const detail = selected ? (
    <View style={{ flex: 1, padding: containerPadding, gap: theme.spacing.md }}>
      <Text variant="title">{selected.name}</Text>
      {uid && selected.ownerId === uid ? (
        <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
          <Button
            title={t('projects.invite')}
            size="sm"
            loading={inviteBusy}
            onPress={() => {
              setInviteBusy(true);
              void createInvite({ targetType: 'project', targetId: selected.id })
                .then(async ({ url }) => {
                  await shareText(t('projects.inviteMessage', { name: selected.name }), url);
                  toast(t('projects.inviteReady'));
                })
                .catch(() => toast(t('projects.inviteFailed'), 'danger'))
                .finally(() => setInviteBusy(false));
            }}
          />
          <Button
            title={t('projects.delete')}
            size="sm"
            variant="danger"
            onPress={() => {
              void deleteProject(selected.id).then(() => {
                setSelectedId(null);
                toast(t('projects.deleted'));
              });
            }}
          />
        </View>
      ) : null}
      {tasksLoading && tasks.length === 0 ? <ProjectsSkeleton /> : null}
      {tasks.map((task) => (
        <CheckboxRow
          key={task.id}
          title={task.title}
          checked={task.done}
          strikethroughWhenChecked
          onValueChange={(checked) => {
            if (uid && !task.id.startsWith('t')) void setTaskDone(selected.id, task.id, checked);
            setSelectedTaskId(task.id);
          }}
        />
      ))}
      {selectedTask && !selectedTask.id.startsWith('t') ? (
        <CommentsSection
          parentPath={`projects/${selected.id}/tasks/${selectedTask.id}`}
          parentOwnerId={selected.ownerId}
        />
      ) : null}
    </View>
  ) : (
    <StateView kind="empty" title={t('projects.selectProject')} />
  );

  return (
    <Screen padded={false} width="full">
      <SyncBanner />
      <SplitView master={master} detail={detail} masterWidth={340} />
      <Dialog
        visible={open}
        title={t('projects.newProject')}
        onClose={() => setOpen(false)}
        actions={[{ title: t('projects.create'), onPress: () => void add() }]}
      >
        <TextField label={t('projects.newProject')} value={name} onChangeText={setName} />
      </Dialog>
    </Screen>
  );
}
