import axios from 'axios';
import { SearchOptions } from '../components/AllPlants';
import { TokenResponse } from './types/auth';
import { Plant } from './types/plant';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/plants`;

export const getPlant = async (
  token: TokenResponse,
  featureId: number
): Promise<Plant> => {
  const endpoint = `${BASE_URL}/${featureId}`;

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};

export const deletePlant = async (
  token: TokenResponse,
  featureId: number
): Promise<Plant> => {
  const endpoint = `${BASE_URL}/${featureId}`;

  return (
    await axios.delete(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};

export const putPlant = async (
  token: TokenResponse,
  featureId: number,
  plant: Plant
): Promise<Plant> => {
  const endpoint = `${BASE_URL}/${featureId}`;

  return (
    await axios.put(endpoint, plant, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data;
};

export const getPlantsFiltered = async (
  token: TokenResponse,
  layerId: number,
  filters: SearchOptions
): Promise<Plant[]> => {
  let endpoint = `${BASE_URL}/?layer_id=${layerId}`;

  if (filters.max_entered_time) {
    endpoint = endpoint.concat(`&max_entered_time=${filters.max_entered_time}`);
  }

  if (filters.min_entered_time) {
    endpoint = endpoint.concat(`&min_entered_time=${filters.min_entered_time}`);
  }

  if (filters.species_name) {
    endpoint = endpoint.concat(`&species_name=${filters.species_name}`);
  }

  if (filters.min_entered_time) {
    endpoint = endpoint.concat(`&notes=${filters.notes}`);
  }

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data.plants;
};
