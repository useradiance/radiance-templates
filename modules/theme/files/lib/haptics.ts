import { Platform } from 'react-native';

type Impact = 'light' | 'medium' | 'success' | 'warning' | 'error';

/**
 * Optional haptic tap. No-ops on web and when expo-haptics is not installed.
 * Call from likes, check-ins, cart adds — never block the UI on failure.
 */
export async function haptic(kind: Impact = 'light'): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const Haptics = await import('expo-haptics');
    if (kind === 'success') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    if (kind === 'warning') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (kind === 'error') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    await Haptics.impactAsync(
      kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
    );
  } catch {
    // expo-haptics is optional; ignore missing native module.
  }
}
