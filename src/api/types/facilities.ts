import { Project, Site } from 'src/types/Organization';
import { paths } from './generated-schema';

export const facilitiesEndpoint = '/api/v1/facility';
export type FacilitiesListResponse =
  paths[typeof facilitiesEndpoint]['get']['responses'][200]['content']['application/json'];

export interface Facility {
  id: number;
  name: string;
  type: FacilitiesListResponse['facilities'][0]['type'];
}

export interface SelectedValues {
  selectedFacility?: Facility;
  selectedSite?: Site;
  selectedProject?: Project;
}
