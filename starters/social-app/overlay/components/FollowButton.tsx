import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { useDocument } from '@/hooks/useDocument';
import { followRef, setFollow } from '@/lib/follows';
import { useAuthStore } from '@/stores/auth';

export function FollowButton({ targetId }: { targetId: string }) {
  const { t } = useTranslation();
  const uid = useAuthStore((state) => state.user?.uid ?? null);

  const { data: outgoing } = useDocument(
    () => followRef(uid!, targetId),
    uid && targetId && uid !== targetId ? `follow:${uid}:${targetId}` : null,
  );
  const { data: incoming } = useDocument(
    () => followRef(targetId, uid!),
    uid && targetId && uid !== targetId ? `follow:${targetId}:${uid}` : null,
  );

  if (!uid || uid === targetId) return null;

  const following = Boolean(outgoing);
  const friends = following && Boolean(incoming);

  return (
    <Button
      size="sm"
      variant={following ? 'secondary' : 'primary'}
      title={friends ? t('people.friends') : following ? t('people.following') : t('people.follow')}
      onPress={() => void setFollow(uid, targetId, !following)}
    />
  );
}
