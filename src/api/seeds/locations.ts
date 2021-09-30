import axios from '..';
import { Locations } from '../types/locations';

export const getLocations = async (facilityId: number): Promise<Locations> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/seedbank/values/storageLocation/${facilityId}`;

  return (await axios.get(endpoint)).data.locations;
};
