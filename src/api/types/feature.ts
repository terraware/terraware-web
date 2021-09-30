import { components, operations } from './generated-schema';

export type FeatureListRequest = operations['list_1']['parameters']['query'];
export type FeatureListResponse =
  components['schemas']['ListFeaturesResponsePayload'];
export type FeatureResponse = components['schemas']['FeatureResponse'];
export type FeatureDeleteResponse =
  components['schemas']['DeleteFeatureResponsePayload'];
export type Point = components['schemas']['Point'];

export interface Feature extends FeatureResponse {
  geom: Point;
}
