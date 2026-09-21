import { getPerformance, trace } from '@react-native-firebase/perf';

export async function withTrace<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const t = trace(getPerformance(), name);
  t.start();
  try {
    return await fn();
  } finally {
    t.stop();
  }
}
