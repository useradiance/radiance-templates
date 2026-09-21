import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Text } from '@/components/ui/Text';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import type { UploadResult } from '@/lib/storage';
import { useTheme } from '@/lib/theme';

export type UploadButtonVariant = 'dropzone' | 'button';

export type UploadButtonProps = {
  label?: string;
  pathBuilder?: (fileName: string) => string;
  onUploaded: (result: UploadResult) => void;
  /** `dropzone` is a dashed picker; `button` is a compact control for avatars / toolbars. */
  variant?: UploadButtonVariant;
};

/** Picks an image, uploads it and reports progress. */
export function UploadButton({
  label,
  pathBuilder,
  onUploaded,
  variant = 'dropzone',
}: UploadButtonProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const upload = useMediaUpload({ pathBuilder });
  const title = label ?? t('storage.chooseImage');

  const pick = async () => {
    const result = await upload.pick();
    if (result) onUploaded(result);
  };

  const status = (
    <>
      {upload.isUploading ? (
        <Progress
          value={upload.progress}
          showPercent
          label={t('storage.uploading', { percent: Math.round(upload.progress * 100) })}
        />
      ) : null}
      {upload.errorKey ? (
        <Text variant="caption" tone="danger">
          {t(upload.errorKey)}
        </Text>
      ) : null}
    </>
  );

  if (variant === 'button') {
    return (
      <View style={{ gap: theme.spacing.sm, alignSelf: 'flex-start' }}>
        <Button
          title={title}
          variant="secondary"
          size="sm"
          loading={upload.isUploading}
          onPress={() => void pick()}
          leading={<Ionicons name="camera-outline" size={16} color={theme.colors.secondaryText} />}
        />
        {status}
      </View>
    );
  }

  return (
    <View style={{ gap: theme.spacing.sm, alignSelf: 'stretch' }}>
      <Pressable
        accessibilityRole="button"
        disabled={upload.isUploading}
        onPress={() => void pick()}
        style={({ pressed }) => ({
          alignItems: 'center',
          justifyContent: 'center',
          gap: theme.spacing.sm,
          paddingVertical: theme.spacing.xl,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radius.xl,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: theme.colors.borderStrong,
          backgroundColor: pressed ? theme.colors.surfaceMuted : theme.colors.surface,
          opacity: upload.isUploading ? 0.7 : 1,
        })}
      >
        <Ionicons name="image-outline" size={28} color={theme.colors.primary} />
        <Text variant="label" weight="semibold" tone="primary">
          {title}
        </Text>
      </Pressable>
      {status}
    </View>
  );
}
