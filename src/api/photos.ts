import axios from 'axios';
import { TokenResponse } from './types/auth';
import { Photo } from './types/photo';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/photos`;

export const getPhotos = async (
  token: TokenResponse,
  featureId: number
): Promise<Photo[]> => {
  const endpoint = `${BASE_URL}?feature_id=${featureId}`;

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data.photos;
};

export const getPhotoBlob = async (
  token: TokenResponse,
  photoId: number
): Promise<Blob> => {
  const endpoint = `${BASE_URL}/${photoId}?image=true`;

  const response = await axios.get(endpoint, {
    responseType: 'arraybuffer',
    headers: {
      Authorization: `${token.token_type} ${token.access_token}`,
    },
  });

  const blob = new Blob([response.data]);

  return blob;
};
