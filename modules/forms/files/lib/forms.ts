import { zodResolver } from '@hookform/resolvers/zod';
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

export type UseAppFormOptions<TValues extends FieldValues> = Omit<
  UseFormProps<TValues>,
  'resolver'
> & {
  schema: z.ZodType<TValues, unknown>;
  defaultValues?: DefaultValues<TValues>;
};

/**
 * Typed react-hook-form setup with a Zod schema resolver.
 */
export function useAppForm<TValues extends FieldValues>(
  options: UseAppFormOptions<TValues>,
): UseFormReturn<TValues> {
  const { schema, ...rest } = options;
  return useForm<TValues>({
    ...rest,
    // Zod 4 + @hookform/resolvers generics do not line up without a narrow cast.
    resolver: zodResolver(schema as never) as Resolver<TValues>,
    mode: rest.mode ?? 'onSubmit',
  });
}
