import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useCollection } from '@/hooks/useCollection';
import { createThread, threadsQuery, type Thread } from '@/lib/community';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function ChannelScreen() {
  const { channelId } = useLocalSearchParams<{ channelId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const uid = useAuthStore((s) => s.user?.uid);
  const [title, setTitle] = useState('');
  const { data } = useCollection<Thread>(
    () => threadsQuery(channelId),
    channelId ? `threads:${channelId}` : null,
  );

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ title: t('community.channels') }} />
      <List
        data={data}
        keyExtractor={(th) => th.id}
        gap="md"
        contentContainerStyle={{ padding: theme.spacing.lg }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
            <TextField label={t('community.newThread')} value={title} onChangeText={setTitle} />
            <Button
              title={t('community.post')}
              onPress={async () => {
                if (!uid || !title.trim()) return;
                const id = await createThread(channelId, title, uid);
                setTitle('');
                router.push(`/thread/${channelId}/${id}`);
              }}
            />
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/thread/${channelId}/${item.id}`)}
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          >
            <Card>
              <Text variant="subtitle">{item.title}</Text>
            </Card>
          </Pressable>
        )}
      />
    </Screen>
  );
}
