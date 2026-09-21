import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { TextField, type TextFieldProps } from '@/components/ui/TextField';

export type FormFieldProps<T extends FieldValues> = Omit<
  TextFieldProps,
  'value' | 'onChangeText' | 'error'
> & {
  control: Control<T>;
  name: FieldPath<T>;
};

/**
 * Theme TextField bound to a react-hook-form control.
 * Zod issue messages are treated as i18n keys (e.g. `forms.invalidEmail`).
 */
export function FormField<T extends FieldValues>({ control, name, ...rest }: FormFieldProps<T>) {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState }) => (
        <TextField
          {...rest}
          value={value == null ? '' : String(value)}
          onChangeText={onChange}
          onBlur={onBlur}
          error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
        />
      )}
    />
  );
}
