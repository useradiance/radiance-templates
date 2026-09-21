import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StateView } from '@/components/ui/StateView';
import { DEMO_ARTICLES } from '@/lib/demo-content';
import { useBookmarksStore } from '@/stores/bookmarks';

export default function BookmarksScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const ids = useBookmarksStore((s) => s.ids);

  return (
    <Screen scroll>
      <SectionHeader title={t('content.bookmarks')} />
      {ids.length === 0 ? (
        <StateView kind="empty" title={t('content.noBookmarks')} />
      ) : (
        ids.map((id) => {
          const article = DEMO_ARTICLES.find((entry) => entry.id === id);
          return (
            <ListRow
              key={id}
              title={article?.title ?? id}
              subtitle={article?.authorName ?? undefined}
              onPress={() => router.push(`/article/${id}`)}
            />
          );
        })
      )}
    </Screen>
  );
}
