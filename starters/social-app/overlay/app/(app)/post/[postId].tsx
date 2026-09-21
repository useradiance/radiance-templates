import { Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { CommentsSection } from '@/components/CommentsSection';
import { Button } from '@/components/ui/Button';
import { MediaImage } from '@/components/ui/MediaImage';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { toast } from '@/components/ui/Toast';
import { useDocument } from '@/hooks/useDocument';
import { postRef, type Post } from '@/lib/posts';
import { buildShareUrl, shareText } from '@/lib/share';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { t } = useTranslation();
  const { data } = useDocument<Post>(() => postRef(postId), postId ? `post:${postId}` : null);

  const onShare = async () => {
    const outcome = await shareText(
      data?.text ?? t('feed.title'),
      buildShareUrl(`/post/${postId}`),
    );
    if (outcome === 'copied') toast(t('share.copied'));
  };

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: t('feed.postTitle') }} />
      <Text variant="title">{data?.authorName ?? t('feed.anonymous')}</Text>
      {data?.imageUrl ? <MediaImage uri={data.imageUrl} aspectRatio={4 / 3} /> : null}
      <Text variant="body">{data?.text}</Text>
      <Button title={t('feed.share')} onPress={() => void onShare()} />
      <CommentsSection parentPath={`posts/${postId}`} />
    </Screen>
  );
}
