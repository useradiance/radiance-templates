import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { doc } from 'firebase/firestore';

import { CommentsSection } from '@/components/CommentsSection';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CheckboxRow } from '@/components/ui/CheckboxRow';
import { List } from '@/components/ui/List';
import { Skeleton } from '@/components/ui/Skeleton';
import { StateView } from '@/components/ui/StateView';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/Toast';
import { useCollection } from '@/hooks/useCollection';
import { useDocument } from '@/hooks/useDocument';
import { getDb } from '@/lib/firestore';
import { createInvite } from '@/lib/invites';
import {
  createTask,
  deleteProject,
  setTaskDone,
  tasksQuery,
  type Project,
  type Task,
} from '@/lib/projects';
import { shareText } from '@/lib/share';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function ProjectScreen() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const [title, setTitle] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);

  const { data: project } = useDocument<Project>(
    () => doc(getDb(), 'projects', projectId),
    projectId ? `project:${projectId}` : null,
  );
  const { data: tasks, isLoading } = useCollection<Task>(
    () => tasksQuery(projectId),
    projectId ? `tasks:${projectId}` : null,
  );
  const selectedTask = (tasks ?? []).find((task) => task.id === selectedTaskId) ?? (tasks ?? [])[0];

  const add = async () => {
    if (!projectId || title.trim().length === 0) return;
    const value = title;
    setTitle('');
    await createTask(projectId, value, uid ?? undefined);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: project?.name ?? t('tasks.title') }} />

      <List
        data={tasks}
        keyExtractor={(task) => task.id}
        gap="sm"
        contentContainerStyle={{ padding: theme.spacing.lg }}
        ListHeaderComponent={
          <Card style={{ marginBottom: theme.spacing.sm, gap: theme.spacing.sm }}>
            {uid && project?.ownerId === uid ? (
              <View style={{ flexDirection: 'row', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                <Button
                  title={t('projects.invite')}
                  size="sm"
                  loading={inviteBusy}
                  onPress={() => {
                    if (!projectId) return;
                    setInviteBusy(true);
                    void createInvite({ targetType: 'project', targetId: projectId })
                      .then(async ({ url }) => {
                        await shareText(
                          t('projects.inviteMessage', { name: project?.name ?? '' }),
                          url,
                        );
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
                    if (!projectId) return;
                    void deleteProject(projectId).then(() => {
                      toast(t('projects.deleted'));
                      router.replace('/');
                    });
                  }}
                />
              </View>
            ) : null}
            <TextField
              label={t('tasks.newTask')}
              value={title}
              onChangeText={setTitle}
              onSubmitEditing={add}
              returnKeyType="done"
            />
            <Button title={t('tasks.add')} onPress={add} disabled={title.trim().length === 0} />
          </Card>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={{ gap: theme.spacing.sm }}>
              {[0, 1, 2].map((key) => (
                <Skeleton key={key} height={56} radius="lg" />
              ))}
            </View>
          ) : (
            <StateView
              kind="empty"
              title={t('tasks.emptyTitle')}
              description={t('tasks.emptyDescription')}
            />
          )
        }
        renderItem={({ item }) => (
          <CheckboxRow
            title={item.title}
            checked={item.done}
            strikethroughWhenChecked
            onValueChange={(checked) => {
              if (projectId) void setTaskDone(projectId, item.id, checked);
              setSelectedTaskId(item.id);
            }}
          />
        )}
        ListFooterComponent={
          selectedTask && projectId ? (
            <View style={{ marginTop: theme.spacing.md }}>
              <CommentsSection
                parentPath={`projects/${projectId}/tasks/${selectedTask.id}`}
                parentOwnerId={project?.ownerId}
              />
            </View>
          ) : null
        }
      />
    </View>
  );
}
