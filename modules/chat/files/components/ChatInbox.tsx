import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import { Fab } from '@/components/ui/Fab';
import { List } from '@/components/ui/List';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SplitView } from '@/components/ui/SplitView';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/Toast';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import {
  chatUserLabel,
  createThread,
  directoryQuery,
  inboxQuery,
  type ChatUser,
  type Thread,
} from '@/lib/chat';
import { withDemoFallback } from '@/lib/demo-fallback';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

const DEMO_THREADS: Thread[] = [
  {
    id: 'c-maya',
    memberIds: ['preview', 'demo-maya'],
    title: 'Maya Chen',
    lastMessage: 'See you at 7 — I will grab a table.',
  },
  {
    id: 'c-jordan',
    memberIds: ['preview', 'demo-jordan'],
    title: 'Jordan Hale',
    lastMessage: 'The oak place is quieter after 4.',
  },
  {
    id: 'c-priya',
    memberIds: ['preview', 'demo-priya'],
    title: 'Priya Nair',
    lastMessage: 'Ridge loop tomorrow if the fog lifts.',
  },
  {
    id: 'c-alex',
    memberIds: ['preview', 'demo-alex'],
    title: 'Alex Rivera',
    lastMessage: 'Sending the type samples in a minute.',
  },
  {
    id: 'c-sam',
    memberIds: ['preview', 'demo-sam'],
    title: 'Sam Okonkwo',
    lastMessage: 'Saved you a seat. Come hungry.',
  },
];

const DEMO_MESSAGES: Record<string, { mine: boolean; text: string }[]> = {
  'c-maya': [
    { mine: false, text: 'Are we still on for dinner?' },
    { mine: true, text: 'Yes — 7 works.' },
    { mine: false, text: 'See you at 7 — I will grab a table.' },
  ],
  'c-jordan': [
    { mine: true, text: 'Coffee this afternoon?' },
    { mine: false, text: 'The oak place is quieter after 4.' },
  ],
  'c-priya': [
    { mine: false, text: 'Ridge loop tomorrow if the fog lifts.' },
    { mine: true, text: 'I am in. Extra water.' },
  ],
  'c-alex': [
    { mine: true, text: 'Need the magazine lockup.' },
    { mine: false, text: 'Sending the type samples in a minute.' },
  ],
  'c-sam': [{ mine: false, text: 'Saved you a seat. Come hungry.' }],
};

/** Inbox list + new-chat people picker. Used by `/chat` and messaging home tab. */
export function ChatInbox() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop, containerPadding } = useResponsive();
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [startingUid, setStartingUid] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, isLoading } = useCollection<Thread>(
    () => inboxQuery(uid!),
    uid ? `inbox:${uid}` : null,
  );
  const { data: people, isLoading: peopleLoading } = useCollection<ChatUser>(
    () => directoryQuery(),
    open && uid ? `chat-directory:${uid}` : null,
  );
  const threads = withDemoFallback(data, DEMO_THREADS);
  const selected =
    threads.find((thread) => thread.id === selectedId) ?? (isDesktop ? threads[0] : null);

  const directory = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    return [...people]
      .filter((user) => {
        const id = user.uid || user.id;
        if (!id || id === uid) return false;
        if (!needle) return true;
        const hay = `${user.displayName ?? ''} ${user.email ?? ''} ${id}`.toLowerCase();
        return hay.includes(needle);
      })
      .sort((a, b) => chatUserLabel(a).localeCompare(chatUserLabel(b)));
  }, [people, filter, uid]);

  function closeNewChat() {
    setOpen(false);
    setFilter('');
    setStartingUid(null);
  }

  async function startWith(peer: ChatUser) {
    if (!uid) return;
    const peerId = peer.uid || peer.id;
    if (!peerId) return;
    setStartingUid(peerId);
    try {
      const id = await createThread([uid, peerId], chatUserLabel(peer));
      closeNewChat();
      router.push(`/chat/${id}`);
    } catch {
      toast(t('chat.startError'), 'danger');
      setStartingUid(null);
    }
  }

  const master = (
    <View style={{ flex: 1 }}>
      <List
        data={threads}
        keyExtractor={(item) => item.id}
        gap="md"
        width="full"
        contentContainerStyle={{ padding: containerPadding, paddingBottom: 96 }}
        ListHeaderComponent={
          <SectionHeader title={t('chat.inbox')} subtitle={t('chat.inboxSubtitle')} />
        }
        ListEmptyComponent={
          isLoading ? (
            <StateView kind="loading" title={t('chat.loading')} />
          ) : (
            <StateView kind="empty" title={t('chat.empty')} description={t('chat.emptyHint')} />
          )
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (isDesktop) setSelectedId(item.id);
              else router.push(`/chat/${item.id}`);
            }}
            style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1 })}
          >
            <Card>
              <Text variant="subtitle">{item.title || t('chat.conversation')}</Text>
              {item.lastMessage ? (
                <Text variant="body" tone="muted" numberOfLines={1}>
                  {item.lastMessage}
                </Text>
              ) : null}
            </Card>
          </Pressable>
        )}
      />
      <View
        style={{
          position: 'absolute',
          right: theme.spacing.lg,
          bottom: theme.spacing.lg,
        }}
      >
        <Fab
          accessibilityLabel={t('chat.new')}
          label={t('chat.new')}
          onPress={() => setOpen(true)}
        />
      </View>
    </View>
  );

  const messages = selected ? (DEMO_MESSAGES[selected.id] ?? []) : [];
  const detail = selected ? (
    <View style={{ flex: 1, padding: containerPadding, gap: theme.spacing.md }}>
      <Text variant="title">{selected.title || t('chat.conversation')}</Text>
      {messages.map((message, index) => (
        <View
          key={`${selected.id}-${index}`}
          style={{
            alignSelf: message.mine ? 'flex-end' : 'flex-start',
            maxWidth: '76%',
            padding: theme.spacing.md,
            borderRadius: theme.radius.lg,
            backgroundColor: message.mine ? theme.colors.primary : theme.colors.surfaceMuted,
          }}
        >
          <Text
            variant="body"
            style={{ color: message.mine ? theme.colors.primaryText : theme.colors.text }}
          >
            {message.text}
          </Text>
        </View>
      ))}
    </View>
  ) : (
    <StateView
      kind="empty"
      title={t('chat.selectConversation')}
      description={t('chat.selectConversationHint')}
    />
  );

  return (
    <Screen padded={false} width="full">
      <SplitView master={master} detail={detail} masterWidth={360} />
      <Dialog
        visible={open}
        title={t('chat.new')}
        description={t('chat.newHint')}
        onClose={closeNewChat}
        actions={[{ title: t('chat.cancel'), onPress: closeNewChat, variant: 'ghost' }]}
      >
        <TextField
          label={t('chat.searchPeople')}
          value={filter}
          onChangeText={setFilter}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t('chat.searchPeoplePlaceholder')}
        />
        <ScrollView
          style={{ maxHeight: 280 }}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {peopleLoading ? (
            <StateView kind="loading" title={t('chat.loadingPeople')} />
          ) : directory.length === 0 ? (
            <StateView
              kind="empty"
              title={t('chat.noPeople')}
              description={t('chat.noPeopleHint')}
            />
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              {directory.map((user) => {
                const id = user.uid || user.id;
                const name = chatUserLabel(user);
                const busy = startingUid === id;
                return (
                  <ListRow
                    key={id}
                    title={name}
                    subtitle={user.email && user.email !== name ? user.email : undefined}
                    leading={<Avatar name={name} uri={user.photoURL} size="sm" />}
                    onPress={busy ? undefined : () => void startWith(user)}
                  />
                );
              })}
            </View>
          )}
        </ScrollView>
      </Dialog>
    </Screen>
  );
}
