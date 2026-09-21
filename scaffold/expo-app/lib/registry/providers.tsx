import type { ComponentType, ReactNode } from 'react';

// Radiance manages the blocks below. Feature modules register their providers here
// during `radiance add`; edits outside the markers are preserved.
// radiance:providers:imports:start
// radiance:providers:imports:end

export type ProviderComponent = ComponentType<{ children: ReactNode }>;

const providers: ProviderComponent[] = [
  // radiance:providers:list:start
  // radiance:providers:list:end
];

/** Composes every registered provider around the app, outermost first. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {providers.reduceRight<ReactNode>(
        (tree, Provider) => (
          <Provider>{tree}</Provider>
        ),
        children,
      )}
    </>
  );
}
