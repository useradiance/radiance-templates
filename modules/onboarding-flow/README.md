# onboarding-flow module

Post-signup multi-step onboarding using the theme `Onboarding` UI, with MMKV completion persistence, a `/onboarding` route, and an **OnboardingGate** provider that redirects signed-in users until complete. Guests still see marketing / sign-in.

Install with:

```bash
radiance add onboarding-flow
```

**Requires:** `theme`, `navigation`, `i18n`

## What it does

- Three default pages (welcome / sync / ready) — edit copy in locales or the screen.
- Persists `completed` in MMKV via Zustand.
- Skip / Done both mark complete and `router.replace('/(app)')`.
- `OnboardingGate` is registered in `lib/registry/providers.tsx`. It waits for session + persist hydration, ignores guests (so landing/sign-in stay first), and sends signed-in users who have not finished to `/onboarding`.

## What it adds

| Path                      | Purpose                                                 |
| ------------------------- | ------------------------------------------------------- |
| `app/onboarding.tsx`      | Onboarding screen                                       |
| `lib/onboarding-gate.tsx` | Redirect until `completed`                              |
| `stores/onboarding.ts`    | `useOnboardingStore` (`completed`, `complete`, `reset`) |
| `locales/en.json`         | Page titles/bodies + Skip/Next/Done                     |

## Notes

- Uses theme `Onboarding` (`pages`, `skipLabel`, `nextLabel`, `doneLabel`, `onDone`).
- Call `reset()` from a debug settings row if you need to re-show onboarding.
