import axios from 'axios';
import { FeaturePhoto, ListFeaturePhotosResponsePayload } from '../types/photo';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/gis/features`;

export const getPhotos = async (featureId: number): Promise<FeaturePhoto[]> => {
  const endpoint = `${BASE_URL}/${featureId}/photos`;

  const response: ListFeaturePhotosResponsePayload = (await axios.get(endpoint)).data;

  return response.photos;
};

export const getPhotoBlob = async (featureId: number, photoId: number): Promise<Blob | null> => {
  const endpoint = `${BASE_URL}/${featureId}/photos/${photoId}`;

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
