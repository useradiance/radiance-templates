import { getApp } from 'firebase/app';
import { getPerformance, trace as startTrace } from 'firebase/performance';

export async function withTrace<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const perf = getPerformance(getApp());
  const t = startTrace(perf, name);
  t.start();
  try {
    return await fn();
  } finally {
    t.stop();
  }
}
