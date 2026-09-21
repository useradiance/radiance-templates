import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getMissingFirebaseEnvKeys } from '@/lib/env';

/**
 * Placeholder home screen for the bare scaffold. The `navigation` module replaces it
 * with the `(auth)` / `(app)` route groups, and starters supply the real screens.
 */
export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const missing = getMissingFirebaseEnvKeys();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Radiance</Text>
      <Text style={styles.body}>
        The scaffold is running. Add capabilities with `radiance add &lt;module&gt;`.
      </Text>
      {missing.length > 0 ? (
        <Text style={styles.warning}>
          Firebase is not configured yet. Missing: {missing.join(', ')}
        </Text>
      ) : (
        <Text style={styles.ok}>Firebase configuration detected.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111827',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
  },
  warning: {
    fontSize: 14,
    lineHeight: 20,
    color: '#b45309',
  },
  ok: {
    fontSize: 14,
    lineHeight: 20,
    color: '#15803d',
  },
});
