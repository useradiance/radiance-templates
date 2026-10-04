import {
  connectStorageEmulator,
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
  type FirebaseStorage,
  type StorageReference,
} from 'firebase/storage';

import { getFirebaseAuth } from '@/lib/auth';
import { emulatorHost, storageEmulatorPort, useStorageEmulator } from '@/lib/env';
import { getFirebaseApp } from '@/lib/firebase';

const URL_CACHE_TTL_MS = 2 * 60 * 60 * 1000;

type CachedUrl = { url: string; expiresAt: number };

const urlCache = new Map<string, CachedUrl>();

let storage: FirebaseStorage | undefined;

/** Infer a MIME type from a storage path / file name when the blob has none. */
export function guessContentType(pathOrName: string, fallback?: string | null): string | undefined {
  if (fallback && fallback !== 'application/octet-stream') return fallback;
  const lower = pathOrName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return fallback || undefined;
}

export function getStorageInstance(): FirebaseStorage {
  if (storage) return storage;

  storage = getStorage(getFirebaseApp());

  if (useStorageEmulator) {
    connectStorageEmulator(storage, emulatorHost, storageEmulatorPort);
  }

  return storage;
}

export function storageRef(path: string): StorageReference {
  return ref(getStorageInstance(), path);
}

export type UploadResult = {
  /** Persist this path in Firestore — not the signed download URL. */
  path: string;
  /**
   * Alias of `path`. Accepted so LLM-authored call sites that invent `storagePath`
   * typecheck without a repair round. Prefer `path` in hand-written code.
   */
  storagePath: string;
  downloadUrl: string;
};

/**
 * Uploads a local file URI to Cloud Storage.
 *
 * React Native has no `File`, so the URI is read through `fetch` into a blob first. Uploads
 * are resumable, and `onProgress` receives a 0..1 fraction.
 */
export async function uploadFileFromUri(
  uri: string,
  path: string,
  options: { contentType?: string; onProgress?: (fraction: number) => void } = {},
): Promise<UploadResult> {
  // Ensure an ID token is attached — Storage rules need request.auth.
  const user = getFirebaseAuth().currentUser;
  if (!user) {
    throw new Error('Sign in required to upload files.');
  }
  await user.getIdToken();

  const response = await fetch(uri);
  const blob = await response.blob();
  const contentType = guessContentType(path, options.contentType ?? (blob.type || null));

  const reference = storageRef(path);
  const task = uploadBytesResumable(reference, blob, {
    contentType,
  });

  await new Promise<void>((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.totalBytes > 0) {
          options.onProgress?.(snapshot.bytesTransferred / snapshot.totalBytes);
        }
      },
      reject,
      () => resolve(),
    );
  });

  const downloadUrl = await getDownloadURL(reference);
  urlCache.set(path, { url: downloadUrl, expiresAt: Date.now() + URL_CACHE_TTL_MS });
  return { path, storagePath: path, downloadUrl };
}

export async function deleteFile(path: string): Promise<void> {
  urlCache.delete(path);
  await deleteObject(storageRef(path));
}

export function userFilePath(uid: string, fileName: string): string {
  return `users/${uid}/${Date.now()}-${fileName}`;
}

export function avatarPath(uid: string): string {
  return `avatars/${uid}`;
}

/**
 * Resolves a download URL for a storage path with a TTL cache (IRL pattern).
 * Prefer storing `path` in Firestore and calling this at render time.
 */
export async function resolveDownloadUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  const cached = urlCache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }
  const url = await getDownloadURL(storageRef(path));
  urlCache.set(path, { url, expiresAt: Date.now() + URL_CACHE_TTL_MS });
  return url;
}

export function clearDownloadUrlCache(path?: string): void {
  if (path) urlCache.delete(path);
  else urlCache.clear();
}

/** Test helper — exposes TTL constant. */
export const DOWNLOAD_URL_CACHE_TTL_MS = URL_CACHE_TTL_MS;
