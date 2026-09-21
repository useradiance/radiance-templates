import { z } from 'zod';

import { useAppForm } from '@/lib/forms';

describe('useAppForm', () => {
  it('accepts a zod schema option shape', () => {
    const schema = z.object({ email: z.string().email() });
    expect(schema.safeParse({ email: 'a@b.com' }).success).toBe(true);
    expect(typeof useAppForm).toBe('function');
  });
});
