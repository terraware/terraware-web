import { paths } from './generated-schema';

export const facilitiesEndpoint = '/api/v1/facility';
export type FacilitiesListResponse = paths[typeof facilitiesEndpoint]['get']['responses'][200]['content']['application/json'];

export interface Facility {
  id: number;
  type: FacilitiesListResponse['facilities'][0]['type'];
}
