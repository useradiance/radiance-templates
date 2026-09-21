# demo-data module

Optional sample documents so a starter looks populated on first open.

```bash
radiance init my-app --template social-app --demo
# or later (also sets EXPO_PUBLIC_SEED_DEMO=true):
radiance add demo-data
```

Seed runs after the first signed-in launch. Starters overlay `lib/demo-content.ts`. Nested docs (for example post likes) are allowlisted on the callable.

On the **paid** path (deployed Functions), the `seedDemo` callable writes with the Admin SDK and locks once per seed version at `_radiance/demo`.

On the **free** path (Functions emulator + cloud Firestore), seeding writes from the client instead. The emulator’s Admin SDK uses Application Default Credentials, which are often a different Google account than `firebase login` and then fail with `PERMISSION_DENIED`. Client writes still respect security rules (so some collections may be skipped). Leave the flag off in production.
