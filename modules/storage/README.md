# storage module

Cloud Storage uploads with progress, image picking and owner-scoped rules.

## What it adds

- `lib/storage.ts` — `getStorageInstance()`, `uploadFileFromUri()`, `deleteFile()`
- `hooks/useMediaUpload.ts` — permission prompt, image picker, upload with progress
- `components/UploadButton.tsx` — dashed dropzone (default) or compact `variant="button"`
- `firebase/storage.rules.fragment` — `users/{uid}/**` (owner write) and `public/**` (world read)

## Usage

```tsx
<UploadButton
  pathBuilder={(fileName) => `public/posts/${Date.now()}-${fileName}`}
  onUploaded={({ path, downloadUrl }) => {
    // Persist `path` (alias: `storagePath`) in Firestore — resolve URLs at render time.
    setImageStoragePath(path);
    setPreviewUri(downloadUrl);
  }}
/>
```

`UploadResult` is `{ path, storagePath, downloadUrl }` — `path` and `storagePath` are the same
object path. Prefer `path` in hand-written code; `storagePath` exists so generated call sites
that invent that name still typecheck.

## Notes

- React Native has no `File` object, so local URIs are read through `fetch` into a blob
  before upload. Uploads are resumable.
- The default rules cap uploads at 10 MB and restrict content types to images, video and PDF.
  Tighten them per product before launch.
- Free plan (cloud Auth + Storage emulator): `firebase.json` points at `storage.emulator.rules`
  because production Auth tokens often leave `request.auth` null in the emulator (403 on owner writes).
  Paid deploy uses owner-scoped `storage.rules`.
- The project needs a default Storage bucket. Radiance enables the API during provisioning,
  but the bucket must exist before the first upload.
