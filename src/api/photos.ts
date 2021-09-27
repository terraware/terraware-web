import axios from 'axios';
import { Photo } from '../types/Photo';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/photos`;

export const getPhotos = async (featureId: number): Promise<Photo[]> => {
  const endpoint = `${BASE_URL}?feature_id=${featureId}`;
  const apiResponse = await axios.get(endpoint);
  return apiResponse.status === 200 ? apiResponse.data.photos : [];
};

export const getPhotoBlob = async (photoId: number): Promise<Blob | null> => {
  const endpoint = `${BASE_URL}/${photoId}?image=true`;

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
