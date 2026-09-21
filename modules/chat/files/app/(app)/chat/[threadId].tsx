import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChatBubble } from '@/components/ChatBubble';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { List } from '@/components/ui/List';
import { MediaImage } from '@/components/ui/MediaImage';
import { Progress } from '@/components/ui/Progress';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/Toast';
import { useCollection } from '@/hooks/useCollection';
import { useDocument } from '@/hooks/useDocument';
import {
  acknowledgeMessages,
  chatAttachmentPath,
  deliveryStatusForSender,
  isGroupHead,
  isGroupTail,
  markThreadRead,
  messagesQuery,
  sendMessage,
  threadRef,
  toggleMessageReaction,
  type ChatMessage,
  type PendingChatMedia,
  type Thread,
} from '@/lib/chat';
import { deleteFile, uploadFileFromUri } from '@/lib/storage';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function ChatThreadScreen() {
  const { threadId } = useLocalSearchParams<{ threadId: string }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const uid = useAuthStore((s) => s.user?.uid ?? null);
  const [text, setText] = useState('');
  const [pending, setPending] = useState<PendingChatMedia | null>(null);
  const [sending, setSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const ackKey = useRef('');

  const { data: thread } = useDocument<Thread>(
    () => threadRef(threadId),
    threadId ? `thread:${threadId}` : null,
  );
  const { data } = useCollection<ChatMessage>(
    () => messagesQuery(threadId),
    threadId ? `messages:${threadId}` : null,
  );

  const memberIds = useMemo(() => thread?.memberIds ?? [], [thread?.memberIds]);

  useEffect(() => {
    if (!uid || !threadId || data.length === 0) return;
    const key = `${threadId}:${uid}:${data.map((m) => m.id).join(',')}`;
    if (ackKey.current === key) return;
    ackKey.current = key;
    void acknowledgeMessages(threadId, uid, data, { delivered: true, seen: true })
      .then(() => markThreadRead(threadId, uid))
      .catch(() => {
        // Retry on next snapshot.
        ackKey.current = '';
      });
  }, [data, threadId, uid]);

  const canSend = Boolean((text.trim() || pending) && uid && threadId && !sending);

  const onAttach = async () => {
    if (!uid || !threadId || sending) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      toast(t('storage.errors.permissionDenied'), 'danger');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });
    if (result.canceled || !result.assets.length) return;
    const asset = result.assets[0];
    setPending({
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? 'photo.jpg',
    });
  };

  const onSend = async () => {
    if (!uid || !threadId || !canSend) return;
    const value = text;
    const media = pending;
    setSending(true);
    setUploadProgress(media ? 0 : 1);

    let uploadedPath: string | null = null;
    try {
      let attachment = null;
      if (media) {
        const path = chatAttachmentPath(uid, threadId, media.name ?? 'photo.jpg');
        const uploaded = await uploadFileFromUri(media.uri, path, {
          contentType: media.mimeType ?? undefined,
          onProgress: setUploadProgress,
        });
        uploadedPath = uploaded.path;
        attachment = {
          path: uploaded.path,
          contentType: media.mimeType ?? 'image/jpeg',
          name: media.name ?? 'photo.jpg',
        };
        setUploadProgress(1);
      }

      await sendMessage(threadId, uid, { text: value, attachment });
      await markThreadRead(threadId, uid);
      setText('');
      setPending(null);
    } catch {
      toast(t('chat.sendError'), 'danger');
      if (uploadedPath) {
        try {
          await deleteFile(uploadedPath);
        } catch {
          // leave orphan if cleanup fails
        }
      }
    } finally {
      setSending(false);
      setUploadProgress(0);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Stack.Screen options={{ title: thread?.title?.trim() || t('chat.conversation') }} />
      <List
        data={data}
        keyExtractor={(m) => m.id}
        gap="none"
        contentContainerStyle={{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xl }}
        renderItem={({ item, index }) => {
          const head = isGroupHead(data, index);
          const tail = isGroupTail(data, index);
          const mine = item.senderId === uid;
          return (
            <View
              style={{
                marginTop: head ? theme.spacing.md : theme.spacing.xs,
                marginBottom: tail ? theme.spacing.xs : 0,
              }}
            >
              <ChatBubble
                message={item}
                mine={mine}
                currentUid={uid}
                showMeta={tail}
                status={mine ? deliveryStatusForSender(item, memberIds) : 'sent'}
                onToggleReaction={(emoji, reacted) => {
                  if (!uid || !threadId) return;
                  void toggleMessageReaction(threadId, item.id, uid, emoji, reacted).catch(() =>
                    toast(t('chat.reactionError'), 'danger'),
                  );
                }}
              />
            </View>
          );
        }}
      />
      {pending ? (
        <View
          style={{
            gap: theme.spacing.sm,
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: theme.spacing.sm,
            }}
          >
            <View style={{ width: 72 }}>
              <MediaImage
                uri={pending.uri}
                aspectRatio={1}
                radius="md"
                accessibilityLabel={pending.name ?? t('chat.attachment')}
              />
            </View>
            <View style={{ flex: 1, gap: theme.spacing.xs }}>
              <Text variant="caption" tone="muted" numberOfLines={2}>
                {pending.name ?? t('chat.attachment')}
              </Text>
              <Text variant="caption" tone="muted">
                {sending ? t('chat.uploading') : t('chat.pendingUpload')}
              </Text>
            </View>
            <IconButton
              name="trash-outline"
              accessibilityLabel={t('chat.removeAttachment')}
              disabled={sending}
              onPress={() => setPending(null)}
            />
          </View>
          {sending ? (
            <Progress
              value={uploadProgress}
              showPercent
              label={t('storage.uploading', { percent: Math.round(uploadProgress * 100) })}
            />
          ) : null}
        </View>
      ) : sending ? (
        <View
          style={{
            paddingHorizontal: theme.spacing.md,
            paddingTop: theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
          }}
        >
          <Progress value={1} showPercent label={t('chat.sending')} />
        </View>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: theme.spacing.sm,
          padding: theme.spacing.md,
          borderTopWidth: pending || sending ? 0 : 1,
          borderTopColor: theme.colors.border,
        }}
      >
        <IconButton
          name="image-outline"
          accessibilityLabel={t('chat.attach')}
          disabled={!uid || !threadId || sending}
          onPress={() => void onAttach()}
        />
        <View style={{ flex: 1 }}>
          <TextField
            label={t('chat.message')}
            value={text}
            onChangeText={setText}
            editable={!sending}
            onSubmitEditing={() => void onSend()}
          />
        </View>
        <Button
          title={t('chat.send')}
          onPress={() => void onSend()}
          disabled={!canSend}
          loading={sending}
        />
      </View>
    </View>
  );
}
