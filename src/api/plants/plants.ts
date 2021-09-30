import axios from 'axios';
import {
  ListPlantsResponseElement,
  ListPlantsResponsePayload,
  PlantResponse,
  PlantSummary,
  PlantSummaryResponsePayload,
  SearchOptions,
  UpdatePlantRequestPayload,
  UpdatePlantResponsePayload,
} from '../types/plant';

const BASE_URL = `${process.env.REACT_APP_TERRAWARE_API}/api/v1/gis/plants`;

export const getPlants = async (
  layerId: number
): Promise<ListPlantsResponseElement[]> => {
  const endpoint = `${BASE_URL}/list/${layerId}`;
  const response: ListPlantsResponsePayload = (await axios.get(endpoint)).data;

  return response.list;
};

export const getPlantSummary = async (
  layerId: number,
  maxEnteredTime: string
): Promise<PlantSummary[]> => {
  const endpoint = `${BASE_URL}/list/summary/${layerId}?maxEnteredTime=${maxEnteredTime}`;
  const response: PlantSummaryResponsePayload = (await axios.get(endpoint))
    .data;

  const apiSummary = response.summary;
  const apiSummaryKeys = Object.keys(apiSummary);

  const plantSummary: PlantSummary[] = [];
  for (const key of apiSummaryKeys) {
    plantSummary.push({
      speciesId: parseInt(key, 10),
      count: apiSummary[key],
    });
  }

  return plantSummary;
};

export const putPlant = async (
  featureId: number,
  plant: UpdatePlantRequestPayload
): Promise<PlantResponse> => {
  const endpoint = `${BASE_URL}/${featureId}`;
  const response: UpdatePlantResponsePayload = (
    await axios.put(endpoint, plant)
  ).data;

  return response.plant;
};

type SearchOptionsKeys = keyof SearchOptions;

export const getPlantsFiltered = async (
  layerId: number,
  filters: SearchOptions
): Promise<ListPlantsResponseElement[]> => {
  let endpoint = `${BASE_URL}/list/${layerId}`;

  const keys = Object.keys(filters) as SearchOptionsKeys[];
  keys.forEach((key) => {
    if (filters[key]) {
      endpoint = endpoint.includes('?')
        ? endpoint.concat('&')
        : endpoint.concat('?');
      endpoint = endpoint.concat(`${String(key)}=${filters[key]}`);
    }
  });

  const response: ListPlantsResponsePayload = (await axios.get(endpoint)).data;

  return response.list;
};
