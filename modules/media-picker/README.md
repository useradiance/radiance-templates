# media-picker module

Pick images (library), capture camera photos, or pick documents — returns local URIs ready for the `storage` upload pipeline.

Install with:

```bash
radiance add media-picker
```

**Requires:** `storage`, `theme`, `i18n`

## What it does

- Wraps `expo-image-picker` and `expo-document-picker`.
- Requests camera permission when capturing.
- Registers the image-picker config plugin with permission strings.

## What it adds

| Path                  | Purpose                                                               |
| --------------------- | --------------------------------------------------------------------- |
| `lib/media-picker.ts` | `pickImageFromLibrary`, `capturePhoto`, `pickDocument`, `PickedMedia` |

## Usage

```ts
import { pickImageFromLibrary } from '@/lib/media-picker';
import { uploadFile } from '@/lib/storage'; // from storage module

const picked = await pickImageFromLibrary();
if (picked) {
  await uploadFile({ uri: picked.uri, path: `uploads/${uid}/${Date.now()}.jpg` });
}
```

`PickedMedia`: `{ uri, mimeType?, name? }`.

## Notes

- Upload / security rules remain in the `storage` module.
- Camera / library permissions are declared via `app.config` plugins on install.
