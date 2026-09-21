import { signInSchema, signUpSchema } from '@/lib/auth-schemas';

describe('auth schemas', () => {
  it('accepts a valid sign-in payload', () => {
    expect(signInSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
  });

  it('rejects an invalid email on sign-in', () => {
    const result = signInSchema.safeParse({ email: 'not-an-email', password: 'secret' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'forms.invalidEmail')).toBe(
        true,
      );
    }
  });

  it('rejects an empty password on sign-in', () => {
    const result = signInSchema.safeParse({ email: 'a@b.com', password: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'forms.required')).toBe(true);
    }
  });

  it('rejects short sign-up passwords', () => {
    const result = signUpSchema.safeParse({ email: 'a@b.com', password: 'short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.message === 'auth.passwordMin')).toBe(true);
    }
  });
});
