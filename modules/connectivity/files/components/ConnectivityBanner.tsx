import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { useTheme } from '@/lib/theme';

export function ConnectivityBanner({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      setOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return unsub;
  }, []);

  return (
    <View style={{ flex: children ? 1 : undefined }}>
      {!online ? (
        <View
          style={{
            backgroundColor: theme.colors.warning ?? theme.colors.primary,
            padding: theme.spacing.sm,
          }}
        >
          <Text variant="caption" style={{ textAlign: 'center', color: theme.colors.primaryText }}>
            {t('connectivity.offline')}
          </Text>
        </View>
      ) : null}
      {children}
    </View>
  );
}
