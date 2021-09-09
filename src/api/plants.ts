import axios from 'axios';
import { SearchOptions } from '../state/selectors/plantsPlantedFiltered';
import { Plant, PlantSummary } from './types/plant';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/plants`;

export const getPlants = async (layerId: number): Promise<Plant[]> => {
  const endpoint = `${BASE_URL}?layer_id=${layerId}`;

  return (await axios.get(endpoint)).data.plants;
};

export const getPlantSummary = async (
  layerId: number,
  maxEnteredTime: string
): Promise<PlantSummary[]> => {
  const endpoint = `${BASE_URL}?layer_id=${layerId}&max_entered_time=${maxEnteredTime}&summary=true`;

  return (await axios.get(endpoint)).data.species_counts;
};

export const deletePlant = async (featureId: number): Promise<Plant> => {
  const endpoint = `${BASE_URL}/${featureId}`;

  return (await axios.delete(endpoint)).data;
};

export const putPlant = async (
  featureId: number,
  plant: Plant
): Promise<Plant> => {
  const endpoint = `${BASE_URL}/${featureId}`;

  return (await axios.put(endpoint, plant)).data;
};

type SearchOptionsKeys = keyof SearchOptions;

export const getPlantsFiltered = async (
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

  return (await axios.get(endpoint)).data.plants;
};
