import axios from 'axios';
import { SearchOptions } from '../state/selectors/plantsPlantedFiltered';
import { TokenResponse } from './types/auth';
import { Plant } from './types/plant';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/plants`;

export const getPlants = async (
  token: TokenResponse,
  layerId: number
): Promise<Plant[]> => {
  const endpoint = `${BASE_URL}?layer_id=${layerId}`;

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data.plants;
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

type SearchOptionsKeys = keyof SearchOptions;

export const getPlantsFiltered = async (
  token: TokenResponse,
  layerId: number,
  filters: SearchOptions
): Promise<Plant[]> => {
  let endpoint = `${BASE_URL}/?layer_id=${layerId}`;

  const keys = Object.keys(filters) as SearchOptionsKeys[];
  keys.forEach((key) => {
    if (filters[key]) {
      endpoint = endpoint.concat(`&${key}=${filters[key]}`);
    }
  });

  return (
    await axios.get(endpoint, {
      headers: {
        Authorization: `${token.token_type} ${token.access_token}`,
      },
    })
  ).data.plants;
};
