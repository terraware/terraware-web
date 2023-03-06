import HttpService, { Response } from './HttpService';

export type PhotoId = {
  photoId: number | null;
};

const uploadPhoto = async (uploadUrl: string, file: File): Promise<Response & PhotoId> => {
  const entity = new FormData();
  entity.append('file', file);

  const headers = {
    'content-type': 'multipart/form-data',
  };

  const response: Response = await HttpService.root(uploadUrl).post({
    entity,
    headers,
  });

  return {
    ...response,
    photoId: response?.data?.id ?? null,
  };
};

/**
 * Upload multiple photos for a report
 */
const uploadPhotos = async (uploadUrl: string, photos: File[]): Promise<((Response & PhotoId) | string)[]> => {
  const uploadPhotoPromises = photos.map((photo) => uploadPhoto(uploadUrl, photo));
  try {
    const promiseResponses = await Promise.allSettled(uploadPhotoPromises);
    return promiseResponses.map((response) => {
      if (response.status === 'rejected') {
        // tslint:disable-next-line: no-console
        console.error(response.reason);
        return response.reason;
      } else {
        return response.value as Response & PhotoId;
      }
    });
  } catch (e) {
    // swallow error
  }

  return [];
};

/**
 * Exported functions
 */
const PhotoService = {
  uploadPhotos,
};

export default PhotoService;
