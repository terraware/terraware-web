import { components, paths } from './generated-schema';

export const featuresEndpoint = '/api/v1/gis/features/list/{layerId}';
export type FeatureListQuery = paths[typeof featuresEndpoint]['get']['parameters']['query'];
export type FeatureListResponse = paths[typeof featuresEndpoint]['get']['responses'][200]['content']['application/json'];
export type FeatureResponse = FeatureListResponse['features'][0];

export const featureEndpoint = '/api/v1/gis/features/{featureId}';

type Point = components['schemas']['Point'];
export interface Feature extends FeatureResponse {
  geom: Point;
}
