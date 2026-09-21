import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';

import { UploadButton } from '@/components/UploadButton';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { useResponsive } from '@/hooks/useResponsive';
import { createPost } from '@/lib/posts';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

const MAX_LENGTH = 1000;

export default function NewPostScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const user = useAuthStore((state) => state.user);

  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const remaining = MAX_LENGTH - text.length;
  const canSubmit = (text.trim().length > 0 || imageUrl !== null) && !isSubmitting && user !== null;

  const submit = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setErrorKey(null);

    const { write } = createPost({
      authorId: user.uid,
      authorName: user.displayName,
      authorPhotoURL: user.photoURL,
      text,
      imageUrl,
    });

    try {
      // Firestore applies the write to the local cache immediately, so the feed updates
      // before the server acknowledges it — and queues it if the device is offline.
      void write();
      setText('');
      setImageUrl(null);
      router.push('/');
    } catch {
      setErrorKey('errors.generic');
    } finally {
      setIsSubmitting(false);
    }
  };

  const composerField = (
    <TextField
      label={isDesktop ? undefined : t('feed.whatsOnYourMind')}
      placeholder={isDesktop ? t('feed.whatsOnYourMind') : undefined}
      value={text}
      onChangeText={(value) => setText(value.slice(0, MAX_LENGTH))}
      multiline
      numberOfLines={isDesktop ? 8 : 5}
      style={{ minHeight: isDesktop ? 180 : 140, textAlignVertical: 'top' }}
      helper={isDesktop ? undefined : t('feed.charactersLeft', { count: remaining })}
    />
  );

  const imagePreview = imageUrl ? (
    <View style={{ gap: theme.spacing.sm, maxWidth: isDesktop ? 360 : undefined }}>
      <Image
        source={{ uri: imageUrl }}
        style={{
          width: '100%',
          aspectRatio: 4 / 3,
          borderRadius: theme.radius.md,
          backgroundColor: theme.colors.skeleton,
        }}
        resizeMode="cover"
      />
      <Button title={t('feed.removeImage')} variant="ghost" onPress={() => setImageUrl(null)} />
    </View>
  ) : null;

  const errorLine = errorKey ? (
    <Text variant="caption" tone="danger">
      {t(errorKey)}
    </Text>
  ) : null;

  if (isDesktop) {
    return (
      <Screen scroll width="feed">
        <Card>
          <View style={{ flexDirection: 'row', gap: theme.spacing.lg, alignItems: 'flex-start' }}>
            <Avatar uri={user?.photoURL} name={user?.displayName} size="lg" />
            <View style={{ flex: 1, gap: theme.spacing.md, minWidth: 0 }}>
              {composerField}
              {imagePreview}
              {errorLine}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  paddingTop: theme.spacing.sm,
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.border,
                }}
              >
                {imageUrl ? null : (
                  <UploadButton
                    variant="button"
                    label={t('feed.addImage')}
                    pathBuilder={(fileName) => `public/posts/${Date.now()}-${fileName}`}
                    onUploaded={({ downloadUrl }) => setImageUrl(downloadUrl)}
                  />
                )}
                <Text variant="caption" tone="muted" style={{ flex: 1 }}>
                  {t('feed.charactersLeft', { count: remaining })}
                </Text>
                <Button
                  title={t('feed.publish')}
                  loading={isSubmitting}
                  disabled={!canSubmit}
                  onPress={() => void submit()}
                />
              </View>
            </View>
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen scroll width="form">
      <Text variant="display">{t('feed.compose')}</Text>

      {composerField}

      {imagePreview ?? (
        <UploadButton
          label={t('feed.addImage')}
          pathBuilder={(fileName) => `public/posts/${Date.now()}-${fileName}`}
          onUploaded={({ downloadUrl }) => setImageUrl(downloadUrl)}
        />
      )}

      {errorLine}

      <Button
        title={t('feed.publish')}
        fullWidth
        loading={isSubmitting}
        disabled={!canSubmit}
        onPress={() => void submit()}
      />
    </Screen>
  );
}
