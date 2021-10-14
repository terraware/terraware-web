import { paths } from './generated-schema';

export const photosEndpoint = '/api/v1/gis/features/{featureId}/photos';
export type PhotosListResponse = paths[typeof photosEndpoint]['get']['responses'][200]['content']['application/json'];
export type FeaturePhoto = PhotosListResponse['photos'][0];

export const photoEndpoint = '/api/v1/gis/features/{featureId}/photos/{photoId}';
