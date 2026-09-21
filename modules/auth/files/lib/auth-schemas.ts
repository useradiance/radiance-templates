import { z } from 'zod';

const emailField = z
  .string()
  .trim()
  .min(1, { error: 'forms.required' })
  .pipe(z.email({ error: 'forms.invalidEmail' }));

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, { error: 'forms.required' }),
});

export const signUpSchema = z.object({
  displayName: z.string().trim().optional(),
  email: emailField,
  password: z.string().min(8, { error: 'auth.passwordMin' }),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
