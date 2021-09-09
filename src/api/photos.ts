import axios from 'axios';
import { Photo } from './types/photo';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/photos`;

export const getPhotos = async (featureId: number): Promise<Photo[]> => {
  const endpoint = `${BASE_URL}?feature_id=${featureId}`;

  return (await axios.get(endpoint)).data.photos;
};

export const getPhotoBlob = async (photoId: number): Promise<Blob> => {
  const endpoint = `${BASE_URL}/${photoId}?image=true`;

  const response = await axios.get(endpoint, {
    responseType: 'arraybuffer',
  });

  const blob = new Blob([response.data]);

  return blob;
};
