import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TextField } from '@/components/ui/TextField';
import { getDb } from '@/lib/firestore';

export default function ContactScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  return (
    <Screen scroll width="form">
      <SectionHeader title={t('local.contact')} subtitle={t('local.contactSubtitle')} />
      <TextField label={t('local.name')} value={name} onChangeText={setName} />
      <TextField label={t('local.message')} value={message} onChangeText={setMessage} />
      <Button
        title={t('local.send')}
        onPress={async () => {
          if (!name.trim() || !message.trim()) return;
          await addDoc(collection(getDb(), 'contactMessages'), {
            name: name.trim(),
            message: message.trim(),
            createdAt: serverTimestamp(),
          });
          setName('');
          setMessage('');
        }}
        fullWidth
      />
    </Screen>
  );
}
