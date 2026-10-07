import { Platform } from 'react-native';

/**
 * Verifies if an image URI is safe and renderable in the current platform environment.
 * Web browsers block file:/// and content:/// URIs with "Not allowed to load local resource".
 */
export const isValidImageUri = (uri?: string | null): boolean => {
  if (!uri || typeof uri !== 'string') return false;
  const trimmed = uri.trim();
  if (!trimmed) return false;

  // On Web (Chrome, Edge, Safari), file:// and content:// are strictly forbidden local resources
  if (Platform.OS === 'web') {
    if (trimmed.startsWith('file://') || trimmed.startsWith('content://')) {
      return false;
    }
  }

  return (
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:') ||
    (Platform.OS !== 'web' && (trimmed.startsWith('file://') || trimmed.startsWith('content://')))
  );
};

/**
 * Converts a native or local URI to a portable base64 Data URL so it can be safely rendered on all platforms (Web and Native).
 */
export const uriToDataUrl = async (uri: string): Promise<string> => {
  if (!uri) return '';
  if (uri.startsWith('data:image/')) return uri;

  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          resolve(uri);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('uriToDataUrl conversion note:', err);
    return uri;
  }
};
