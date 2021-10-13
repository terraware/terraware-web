import axios from '..';
import { facilitiesEndpoint, FacilitiesListResponse, Facility } from '../types/facilities';

export const getAllFacilities = async (): Promise<Facility[]> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${facilitiesEndpoint}`;
  const response: FacilitiesListResponse = (await axios.get(endpoint)).data;

  return response.facilities.map((obj) => ({ id: obj.id, type: obj.type }));
};
