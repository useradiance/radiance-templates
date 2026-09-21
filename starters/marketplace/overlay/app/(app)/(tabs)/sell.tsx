import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TextField } from '@/components/ui/TextField';
import { createListing } from '@/lib/listings';
import { useAuthStore } from '@/stores/auth';

export default function SellScreen() {
  const { t } = useTranslation();
  const uid = useAuthStore((s) => s.user?.uid);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const submit = async () => {
    if (!uid) return;
    const priceInMinorUnits = Math.round(parseFloat(price) * 100);
    if (!title.trim() || Number.isNaN(priceInMinorUnits)) return;
    await createListing({
      title: title.trim(),
      description: description.trim(),
      priceInMinorUnits,
      currency: 'usd',
      sellerId: uid,
    });
    setTitle('');
    setDescription('');
    setPrice('');
  };

  return (
    <Screen scroll width="form">
      <SectionHeader title={t('marketplace.sell')} subtitle={t('marketplace.sellSubtitle')} />
      <TextField label={t('marketplace.title')} value={title} onChangeText={setTitle} />
      <TextField
        label={t('marketplace.description')}
        value={description}
        onChangeText={setDescription}
      />
      <TextField
        label={t('marketplace.price')}
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
      />
      <Button
        title={t('marketplace.publish')}
        onPress={submit}
        disabled={!uid || !title.trim()}
        fullWidth
      />
    </Screen>
  );
}
