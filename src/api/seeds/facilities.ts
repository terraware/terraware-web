import axios from '..';
import { facilitiesEndpoint, FacilitiesListResponse, Facility } from '../types/facilities';

export const getAllFacilities = async (): Promise<Facility[]> => {
  const response: FacilitiesListResponse = (await axios.get(facilitiesEndpoint)).data;

  return response.facilities.map((obj) => ({ id: obj.id, type: obj.type }));
};
