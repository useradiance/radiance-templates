import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { UploadButton } from '@/components/UploadButton';
import { AppHeader } from '@/components/ui/AppHeader';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { List } from '@/components/ui/List';
import { Screen } from '@/components/ui/Screen';
import { StateView } from '@/components/ui/StateView';
import { Text } from '@/components/ui/Text';
import { TextField } from '@/components/ui/TextField';
import { toast } from '@/components/ui/Toast';
import { useCollection } from '@/hooks/useCollection';
import { useResponsive } from '@/hooks/useResponsive';
import { myArticlesQuery, saveArticle, setArticleStatus, type Article } from '@/lib/articles';
import { useTheme } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth';

export default function WriteScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { containerPadding } = useResponsive();
  const user = useAuthStore((s) => s.user);
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { data, isLoading } = useCollection<Article>(
    () => myArticlesQuery(user!.uid),
    user ? `articles:mine:${user.uid}` : null,
  );

  const save = async (status: Article['status']) => {
    if (!user || !title.trim() || !body.trim()) return;
    setBusy(true);
    try {
      const id = await saveArticle({
        title,
        excerpt,
        body,
        coverUrl,
        authorId: user.uid,
        authorName: user.displayName,
        status,
      });
      setTitle('');
      setExcerpt('');
      setBody('');
      setCoverUrl(null);
      toast(status === 'published' ? t('content.published') : t('content.draftSaved'), 'success');
      if (status === 'published') router.push(`/article/${id}`);
    } catch {
      toast(t('content.saveFailed'), 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen padded={false} width="full">
      <List
        data={data}
        keyExtractor={(item) => item.id}
        gap="sm"
        contentContainerStyle={{ padding: containerPadding }}
        ListHeaderComponent={
          <View style={{ gap: theme.spacing.md, marginBottom: theme.spacing.md }}>
            <AppHeader title={t('content.write')} subtitle={t('content.writeSubtitle')} />
            {!user ? (
              <StateView kind="empty" title={t('content.signInToWrite')} />
            ) : (
              <Card>
                <TextField label={t('content.fieldTitle')} value={title} onChangeText={setTitle} />
                <TextField
                  label={t('content.fieldExcerpt')}
                  value={excerpt}
                  onChangeText={setExcerpt}
                />
                <TextField
                  label={t('content.fieldBody')}
                  value={body}
                  onChangeText={setBody}
                  multiline
                  numberOfLines={8}
                  style={{ minHeight: 160, textAlignVertical: 'top' }}
                />
                {coverUrl ? null : (
                  <UploadButton
                    variant="button"
                    label={t('content.addCover')}
                    pathBuilder={(fileName) => `public/articles/${Date.now()}-${fileName}`}
                    onUploaded={({ downloadUrl }) => setCoverUrl(downloadUrl)}
                  />
                )}
                <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
                  <Button
                    title={t('content.saveDraft')}
                    variant="secondary"
                    loading={busy}
                    disabled={!title.trim() || !body.trim()}
                    onPress={() => void save('draft')}
                  />
                  <Button
                    title={t('content.publish')}
                    loading={busy}
                    disabled={!title.trim() || !body.trim()}
                    onPress={() => void save('published')}
                  />
                </View>
              </Card>
            )}
            <Text variant="subtitle">{t('content.yourPieces')}</Text>
          </View>
        }
        ListEmptyComponent={
          isLoading ? (
            <StateView kind="loading" />
          ) : (
            <StateView kind="empty" title={t('content.noDrafts')} />
          )
        }
        renderItem={({ item }) => (
          <Card>
            <Text variant="subtitle">{item.title}</Text>
            <Text variant="caption" tone="muted">
              {item.status === 'published'
                ? t('content.statusPublished')
                : t('content.statusDraft')}
            </Text>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              {item.status === 'draft' ? (
                <Button
                  title={t('content.publish')}
                  size="sm"
                  onPress={() => void setArticleStatus(item.id, 'published')}
                />
              ) : null}
              <Button
                title={t('content.open')}
                size="sm"
                variant="ghost"
                onPress={() => router.push(`/article/${item.id}`)}
              />
            </View>
          </Card>
        )}
      />
    </Screen>
  );
}
