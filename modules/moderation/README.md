# moderation module

User content reports + admin resolution queue, built on `roles`.

Install with:

```bash
radiance add moderation
```

**Requires:** `roles`, `firestore`, `functions`, `auth`, `i18n`, `theme`  
**Side:** `both`

## What it does

- Users create `reports` documents (reason + target path).
- Admins resolve via `resolveReport` callable (`dismissed` | `actioned`).
- `ReportButton` prompts for a reason (iOS prompt; other platforms use default reason text — customize as needed).

## What it adds

| Path                                      | Purpose                          |
| ----------------------------------------- | -------------------------------- |
| `lib/moderation.ts`                       | `reportContent`, `resolveReport` |
| `components/ReportButton.tsx`             | One-tap report CTA               |
| `functions/src/callable/resolveReport.ts` | Admin-only status update         |
| `firebase/firestore.rules.fragment`       | Reporter create/read; admin read |
| `locales/en.json`                         | Report copy                      |

## Data model

```
reports/{reportId}
  targetPath: string
  reason: string
  reporterId: string
  status: 'open' | 'dismissed' | 'actioned'
  createdAt, resolvedBy?, resolvedAt?
```

## Usage

```tsx
<ReportButton targetPath={`posts/${postId}`} />
```

## Setup checklist

1. Ensure an admin claim exists (`roles` module).
2. Deploy `resolveReport` + rules.
3. Build an admin list UI querying `status == 'open'` (not shipped — gate with `RequireRole`).
