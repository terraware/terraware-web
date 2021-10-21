import axios from 'axios';
import {PlantPhoto, PlantRequestError} from 'src/types/Plant';
import {paths} from 'src/api/types/generated-schema';

const LIST_PHOTOS_ENDPOINT = '/api/v1/gis/features/{featureId}/photos';
type ListPhotosResponse = paths[typeof LIST_PHOTOS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
type PhotoMetadataList = ListPhotosResponse['photos'];
const GET_PHOTO_ENDPOINT = '/api/v1/gis/features/{featureId}/photos/{photoId}';
type PhotoData = paths[typeof GET_PHOTO_ENDPOINT]['get']['responses'][200]['content']['image/jpeg'];

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}`;

export type GetPlantPhotoResponse = {
  photo: PlantPhoto;  // Will always be defined so that we can return the requested feature ID to the caller.
  error: PlantRequestError | null;
};

/*
 * getPlantPhoto() always returns a promise that resolves. Errors will be surfaced to the caller in the response object.
 */
export const getPlantPhoto = async (featureId: number): Promise<GetPlantPhotoResponse> => {
  const response: GetPlantPhotoResponse = {
    photo: {
      featureId,
      imgSrc: null,
    },
    error: null,
  };

  try {
    const listPhotosEndpoint = `${BASE_URL}${LIST_PHOTOS_ENDPOINT}`.replace('{featureId}', `${featureId}`);
    // Use all settled so we can handle errors here, instead of in the catch block. This allows us to
    // differentiate between errors thrown by each of the API requests.
    const [photoMetadataResponse] = await Promise.allSettled([axios.get(listPhotosEndpoint)]);
    if (photoMetadataResponse.status === 'rejected') {
      const error = photoMetadataResponse.reason;
      response.error = axios.isAxiosError(error) && error.response?.status === 404
        ? PlantRequestError.FeatureIdNotFound
        : PlantRequestError.RequestFailed;
      return response;
    }
    const photoMetadataList: PhotoMetadataList = photoMetadataResponse.value.data.photos;
    if (photoMetadataList.length === 0) {
      response.error = PlantRequestError.NoPhotosFound;
      return response;
    }
    // Choose first photo associated with the plant.
    const photoId = photoMetadataList[0].id;
    const photoType = photoMetadataList[0].contentType;
    const getPhotoEndpoint = `${BASE_URL}${GET_PHOTO_ENDPOINT}`
                                  .replace('{featureId}', `${featureId}`)
                                  .replace('{photoId}', `${photoId}`);
    const photoData: PhotoData = (await axios.get(getPhotoEndpoint, {responseType: 'arraybuffer'})).data;
    const urlCreator = window.URL || window.webkitURL;
    response.photo = {
      imgSrc: urlCreator.createObjectURL(new Blob([photoData], {type: photoType})),
      featureId,
    };
  } catch(error) {
     response.error = PlantRequestError.RequestFailed;
  }

  return response;
};
