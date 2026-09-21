import { call } from '@/lib/callable';

export async function bootstrapFirstAdmin(): Promise<{ ok: true; already: boolean }> {
  return call('bootstrapFirstAdmin', {});
}
