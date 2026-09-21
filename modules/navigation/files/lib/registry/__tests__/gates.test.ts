import { AuthGate } from '@/lib/registry/AuthGate';
import { GuestGate } from '@/lib/registry/GuestGate';

describe('navigation gates', () => {
  it('exports AuthGate and GuestGate components', () => {
    expect(typeof AuthGate).toBe('function');
    expect(typeof GuestGate).toBe('function');
  });
});
