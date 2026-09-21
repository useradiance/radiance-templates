import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Onboarding } from '@/components/ui/Onboarding';
import { useTheme } from '@/lib/theme';
import { useOnboardingStore } from '@/stores/onboarding';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const complete = useOnboardingStore((s) => s.complete);

  const finish = () => {
    complete();
    router.replace('/(app)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Onboarding
        pages={[
          { title: t('onboarding.page1Title'), body: t('onboarding.page1Body') },
          { title: t('onboarding.page2Title'), body: t('onboarding.page2Body') },
          { title: t('onboarding.page3Title'), body: t('onboarding.page3Body') },
        ]}
        skipLabel={t('onboarding.skip')}
        nextLabel={t('onboarding.next')}
        doneLabel={t('onboarding.done')}
        onSkip={finish}
        onDone={finish}
      />
    </View>
  );
}
