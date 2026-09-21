# functions module

The serverless half of a Radiance app: Cloud Functions 2nd gen in TypeScript (**yarn**).

## Layout

```text
functions/
├── package.json         yarn-managed, independent of the app workspace
├── tsconfig.json
└── src/
    ├── index.ts         every export lives here (radiance:functions markers)
    ├── callable/        onCall handlers invoked from the app
    ├── http/            onRequest endpoints and webhooks
    ├── triggers/        Firestore / identity / storage triggers
    ├── scheduled/       onSchedule jobs (see cleanupStaleDocs.ts)
    └── lib/             errors.ts, idempotency.ts and shared helpers
```

## Working locally

```bash
yarn --cwd functions install
yarn functions:serve        # functions + firestore + auth emulators
```

## Deploying

```bash
firebase deploy --only functions
```

The `predeploy` hook in `firebase.json` builds TypeScript before upload (`yarn --cwd … build`).

## Config: three buckets

| Bucket        | Manifest field | Runtime                               | Local file                | Production                                    |
| ------------- | -------------- | ------------------------------------- | ------------------------- | --------------------------------------------- |
| Client public | `env`          | App / Metro (`EXPO_PUBLIC_*`)         | root `.env`               | EAS / hosting env                             |
| Server secret | `secrets`      | `defineSecret` + `{ secrets: [...] }` | `functions/.secret.local` | `firebase functions:secrets:set KEY`          |
| Server param  | `params`       | `defineString`                        | `functions/.env`          | Functions params / `functions/.env` at deploy |

Never put API keys, webhook secrets, or PEMs in root `.env` or Remote Config. Never prefix
secrets/params with `EXPO_PUBLIC_`.

`radiance add` prompts for secrets/params when a module declares them, appends params to
`functions/.env.example`, and reminds you to run `functions:secrets:set` for production.

`radiance init` does **not** block on secrets/params (you can create the project first).
`radiance build` requires all required client `env` keys; `radiance deploy` (with Functions)
requires params in `functions/.env` and secrets in Firebase Secret Manager.

## Conventions

- Every handler is exported from `src/index.ts`; modules append their exports between the
  `radiance:functions` markers.
- Throw `HttpsError` with a code from `ErrorCode` so the client can map it to a translated
  message. Never leak raw internal errors. Use `requireAuth` / `requireVerifiedEmail`.
- Wrap side-effecting webhook and trigger work in `runOnce(eventId, handler)` — providers
  retry, and duplicate charges or duplicate emails are unacceptable.
- Secrets come from Secret Manager (`defineSecret`), never from committed config.
- Non-secret backend config (from-address, price ids, provider URLs) uses `defineString`.
- `setGlobalOptions({ maxInstances })` is a deliberate cost guardrail; raise it consciously.
- Cross-user Firestore writes belong here (Admin SDK); keep those paths closed in rules.

## Requirements

Cloud Functions need the **Blaze** plan. Radiance enables the Cloud Functions, Cloud Build,
Artifact Registry, Run, Eventarc and Secret Manager APIs during provisioning.
