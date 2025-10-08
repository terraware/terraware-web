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
    // Use a minimal valid HEIC image for detection (base64 encoded)
    const heicBase64 = 'AAAAHGZ0eXBIRUlDAABtaW5mAAAAAGhlaWMAAAAQc3BpbgEAAAAAAAAAAA=='; // Minimal HEIC header
    const binaryString = atob(heicBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const heicBlob = new Blob([bytes], { type: 'image/heic' });
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
