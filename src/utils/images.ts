const getImagePath = (projectId: number, imageId: number, maxHeight?: number, maxWidth?: number): string => {
  let path = `/api/v1/document-producer/projects/${projectId}/images/${imageId}`;

  if (maxHeight !== undefined || maxWidth !== undefined) {
    path += '?';
    if (maxHeight !== undefined) {
      path += `maxHeight=${maxHeight}&`;
    }
    if (maxWidth !== undefined) {
      path += `maxWidth=${maxWidth}`;
    }
  }

  return path;
};

/**
 * Check if a file is an HEIC/HEIF image based on its type or extension
 */
const isHeicFile = (file: File): boolean => {
  const heicMimeTypes = ['image/heic'];
  const heicExtensions = ['.heic'];

  if (heicMimeTypes.includes(file.type.toLowerCase())) {
    return true;
  }

  const fileName = file.name.toLowerCase();
  return heicExtensions.some((ext) => fileName.endsWith(ext));
};

// cache for HEIC support detection result
let heicSupportCache: boolean | null = null;

async function isHeicSupportedByBrowser(): Promise<boolean> {
  // return cached result if available
  if (heicSupportCache !== null) {
    return heicSupportCache;
  }

  if (!('createImageBitmap' in window)) {
    heicSupportCache = false;
    return false;
  }

  try {
    const heicBlob = new Blob([''], { type: 'image/heic' });
    await createImageBitmap(heicBlob);
    heicSupportCache = true;
    return true;
  } catch {
    heicSupportCache = false;
    return false;
  }
}

/**
 * Determine if we should show a placeholder for an HEIC file
 */
const shouldShowHeicPlaceholder = async (file: File): Promise<boolean> => {
  if (!isHeicFile(file)) {
    return false;
  }

  const isSupported = await isHeicSupportedByBrowser();
  return !isSupported;
};

export { getImagePath, isHeicFile, isHeicSupportedByBrowser, shouldShowHeicPlaceholder };
