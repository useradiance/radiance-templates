import type { QueryStatus } from '@/hooks/useCollection';

describe('firestore hook status type', () => {
  it('includes pending success and error', () => {
    const statuses: QueryStatus[] = ['pending', 'success', 'error'];
    expect(statuses).toHaveLength(3);
  });
});
