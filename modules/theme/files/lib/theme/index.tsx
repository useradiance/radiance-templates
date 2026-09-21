import { type ReactNode } from 'react';

import { ToastHost } from '@/components/ui/Toast';
import { ThemeRoot } from '@/lib/theme/context';

export * from '@/lib/theme/tokens';
export { themePacks, ACTIVE_PACK } from '@/lib/theme/config';
export { useTheme, createStyles } from '@/lib/theme/context';

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeRoot>
      {children}
      <ToastHost />
    </ThemeRoot>
  );
}
