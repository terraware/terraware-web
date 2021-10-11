import axios from '..';
import { FeaturePhoto, photoEndpoint, photosEndpoint, PhotosListResponse } from '../types/photo';

export const getPhotos = async (featureId: number): Promise<FeaturePhoto[]> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${photosEndpoint}`.replace('{featureId}', `${featureId}`);

  const response: PhotosListResponse = (await axios.get(endpoint)).data;

  return response.photos;
};

export const getPhotoBlob = async (featureId: number, photoId: number): Promise<Blob | null> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${photoEndpoint}`.replace('{featureId}', `${featureId}`).replace('{photoId}', `${photoId}`);

  const response = await axios.get(endpoint, {
    responseType: 'arraybuffer',
  });

  if (response.status === 200) {
    return new Blob([response.data]);
  } else {
    console.error('Could not fetch Feature Photo.');

    return null;
  }
};
