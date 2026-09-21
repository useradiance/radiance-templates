# forms module

Shared form stack: **react-hook-form** + **Zod**, wired to theme `TextField` with translated validation errors.

Install with:

```bash
radiance add forms
```

**Requires:** `i18n`, `theme`

## What it does

- Standardizes form state and Zod resolvers across auth and domain screens.
- `FormField` connects RHF control to the theme text field (labels, errors, helpers).
- Helpers map Zod issues to i18n keys so validation copy stays localized.

## What it adds

| Path                             | Purpose                                    |
| -------------------------------- | ------------------------------------------ |
| `components/forms/FormField.tsx` | RHF-controlled field → theme `TextField`   |
| `lib/forms.ts`                   | Shared helpers (resolvers / error mapping) |
| `lib/__tests__/forms.test.ts`    | Unit tests                                 |

## Usage

```tsx
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormField } from '@/components/forms/FormField';

const schema = z.object({
  email: z.string().email(),
});

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '' },
});

<FormField control={control} name="email" label={t('auth.email')} />;
```

(Exact `FormField` props follow the installed component — prefer it over raw `TextInput`.)

## Notes

- Required by `auth` and most starters that collect input.
- Keep Zod schemas next to screens or in `lib/*-schemas.ts` for reuse.
- Harness prompts assume this stack — avoid inventing alternate form libraries.
