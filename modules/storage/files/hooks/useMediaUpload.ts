import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import { uploadFileFromUri, userFilePath, type UploadResult } from '@/lib/storage';
import { useAuthStore } from '@/stores/auth';

export type MediaUploadState = {
  pick: () => Promise<UploadResult | null>;
  progress: number;
  isUploading: boolean;
  errorKey: string | null;
};

/**
 * Picks an image from the library and uploads it under the signed-in user's folder.
 *
 * `pathBuilder` lets a caller redirect the upload, e.g. to `public/posts/...`.
 */
export function useMediaUpload(
  options: { pathBuilder?: (fileName: string) => string } = {},
): MediaUploadState {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const uid = useAuthStore((state) => state.user?.uid ?? null);

  const pick = async (): Promise<UploadResult | null> => {
    setErrorKey(null);

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setErrorKey('storage.errors.permissionDenied');
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (result.canceled || !result.assets.length) return null;
    if (!uid) {
      setErrorKey('storage.errors.signInRequired');
      return null;
    }

    const asset = result.assets[0];
    const fileName = asset.fileName ?? 'upload.jpg';
    const path = options.pathBuilder?.(fileName) ?? userFilePath(uid, fileName);

    setIsUploading(true);
    setProgress(0);

    try {
      return await uploadFileFromUri(asset.uri, path, {
        contentType: asset.mimeType,
        onProgress: setProgress,
      });
    } catch {
      setErrorKey('storage.errors.uploadFailed');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return { pick, progress, isUploading, errorKey };
}
