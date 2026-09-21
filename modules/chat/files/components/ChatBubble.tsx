import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Modal, Pressable, StyleSheet, View } from 'react-native';

import { MediaImage } from '@/components/ui/MediaImage';
import { Text } from '@/components/ui/Text';
import { useStorageUrl } from '@/hooks/useStorageUrl';
import {
  CHAT_REACTION_EMOJI,
  formatMessageTime,
  isImageAttachment,
  type ChatAttachment,
  type ChatDeliveryStatus,
  type ChatMessage,
} from '@/lib/chat';
import { useTheme } from '@/lib/theme';

type Props = {
  message: ChatMessage;
  mine: boolean;
  currentUid: string | null;
  /** Show timestamp (+ delivery ticks for own messages). */
  showMeta?: boolean;
  status?: ChatDeliveryStatus;
  onToggleReaction: (emoji: string, reacted: boolean) => void;
};

function AttachmentBody({ attachment, mine }: { attachment: ChatAttachment; mine: boolean }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { url, isLoading } = useStorageUrl(attachment.path);
  const label = attachment.name?.trim() || t('chat.attachment');
  const fg = mine ? theme.colors.primaryText : theme.colors.text;
  const muted = mine ? theme.colors.primaryText : theme.colors.textMuted;

  if (isImageAttachment(attachment)) {
    return (
      <View style={{ width: 220, maxWidth: '100%' }}>
        {url ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={label}
            onPress={() => void Linking.openURL(url)}
          >
            <MediaImage uri={url} aspectRatio={4 / 3} radius="md" accessibilityLabel={label} />
          </Pressable>
        ) : (
          <View
            style={{
              width: '100%',
              aspectRatio: 4 / 3,
              borderRadius: theme.radius.md,
              backgroundColor: theme.colors.skeleton,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text variant="caption" style={{ color: muted }}>
              {isLoading ? t('chat.attachmentLoading') : t('chat.attachmentUnavailable')}
            </Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      disabled={!url}
      onPress={() => {
        if (url) void Linking.openURL(url);
      }}
      style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}
    >
      <Text variant="body" weight="semibold" style={{ color: fg, textDecorationLine: 'underline' }}>
        {isLoading ? t('chat.attachmentLoading') : `📎 ${label}`}
      </Text>
    </Pressable>
  );
}

function ReactionChips({
  message,
  currentUid,
  onToggleReaction,
}: {
  message: ChatMessage;
  currentUid: string | null;
  onToggleReaction: (emoji: string, reacted: boolean) => void;
}) {
  const theme = useTheme();
  const reactions = message.reactions ?? {};
  const chips = Object.entries(reactions)
    .filter(([, uids]) => Array.isArray(uids) && uids.length > 0)
    .sort(([a], [b]) => a.localeCompare(b));

  if (chips.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs }}>
      {chips.map(([emoji, uids]) => {
        const mine = Boolean(currentUid && uids.includes(currentUid));
        return (
          <Pressable
            key={emoji}
            accessibilityRole="button"
            accessibilityState={{ selected: mine }}
            accessibilityLabel={`${emoji} ${uids.length}`}
            onPress={() => onToggleReaction(emoji, mine)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: theme.spacing.sm,
              paddingVertical: theme.spacing.xs,
              borderRadius: theme.radius.pill,
              borderWidth: 1,
              borderColor: mine ? theme.colors.primary : theme.colors.border,
              backgroundColor: mine ? theme.colors.surfaceElevated : theme.colors.surface,
              opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text variant="caption">{emoji}</Text>
            <Text variant="caption" tone="muted">
              {uids.length}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ReactionPicker({
  visible,
  message,
  currentUid,
  onClose,
  onToggleReaction,
}: {
  visible: boolean;
  message: ChatMessage;
  currentUid: string | null;
  onClose: () => void;
  onToggleReaction: (emoji: string, reacted: boolean) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const reactions = message.reactions ?? {};

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: theme.spacing.xl,
          backgroundColor: theme.colors.overlay,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('chat.cancel')}
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={{
            alignSelf: 'center',
            zIndex: 1,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: theme.spacing.sm,
            padding: theme.spacing.lg,
            borderRadius: theme.radius.xl,
            backgroundColor: theme.colors.surface,
            maxWidth: 320,
            ...theme.elevation.medium,
          }}
        >
          <Text variant="label" tone="muted" style={{ width: '100%', textAlign: 'center' }}>
            {t('chat.react')}
          </Text>
          {CHAT_REACTION_EMOJI.map((emoji) => {
            const uids = reactions[emoji] ?? [];
            const mine = Boolean(currentUid && uids.includes(currentUid));
            return (
              <Pressable
                key={emoji}
                accessibilityRole="button"
                accessibilityLabel={emoji}
                accessibilityState={{ selected: mine }}
                onPress={() => {
                  onToggleReaction(emoji, mine);
                  onClose();
                }}
                style={({ pressed }) => ({
                  width: 44,
                  height: 44,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme.radius.pill,
                  backgroundColor:
                    mine || pressed ? theme.colors.surfaceMuted : theme.colors.surfaceElevated,
                })}
              >
                <Text variant="title">{emoji}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Modal>
  );
}

function DeliveryTicks({ status, color }: { status: ChatDeliveryStatus; color: string }) {
  if (status === 'sent') {
    return <Ionicons name="checkmark" size={14} color={color} />;
  }
  return (
    <Ionicons
      name="checkmark-done"
      size={14}
      color={status === 'seen' ? color : color}
      style={{ opacity: status === 'seen' ? 1 : 0.7 }}
    />
  );
}

/** One message bubble: attachment, caption, receipts; long-press to react. */
export function ChatBubble({
  message,
  mine,
  currentUid,
  showMeta = true,
  status = 'sent',
  onToggleReaction,
}: Props) {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);
  const hasText = Boolean(message.text?.trim());
  const attachment = message.attachment?.path ? message.attachment : null;
  const timeLabel = formatMessageTime(message, i18n.language);
  const metaColor = mine ? theme.colors.primaryText : theme.colors.textMuted;

  return (
    <View
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        gap: theme.spacing.xs,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityHint={t('chat.longPressReact')}
        onLongPress={() => setPickerOpen(true)}
        delayLongPress={350}
        style={({ pressed }) => ({ opacity: pressed ? 0.92 : 1 })}
      >
        <View
          style={{
            padding: theme.spacing.md,
            borderRadius: theme.radius.lg,
            gap: theme.spacing.sm,
            backgroundColor: mine ? theme.colors.primary : theme.colors.surface,
          }}
        >
          {attachment ? <AttachmentBody attachment={attachment} mine={mine} /> : null}
          {hasText ? (
            <Text
              variant="body"
              style={{
                color: mine ? theme.colors.primaryText : theme.colors.text,
              }}
            >
              {message.text}
            </Text>
          ) : null}
          {showMeta ? (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: theme.spacing.xs,
                marginTop: theme.spacing.xs,
              }}
            >
              {timeLabel ? (
                <Text variant="caption" style={{ color: metaColor, opacity: 0.85 }}>
                  {timeLabel}
                </Text>
              ) : null}
              {mine ? (
                <DeliveryTicks
                  status={status}
                  color={status === 'seen' ? theme.colors.primaryText : metaColor}
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </Pressable>
      <ReactionChips
        message={message}
        currentUid={currentUid}
        onToggleReaction={onToggleReaction}
      />
      <ReactionPicker
        visible={pickerOpen}
        message={message}
        currentUid={currentUid}
        onClose={() => setPickerOpen(false)}
        onToggleReaction={onToggleReaction}
      />
    </View>
  );
}
