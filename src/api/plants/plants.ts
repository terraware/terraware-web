import addQueryParams from 'src/api/addQueryParams';
import axios from '..';
import {
  plantEndpoint,
  plantsEndpoint,
  PlantsListQuery,
  PlantsListResponse,
  PlantsListResponseElement,
  PlantsSummaryQuery,
  PlantsSummaryResponse,
  plantsSummmaryEndpoint,
  PlantSummary,
  PlantUpdateRequestBody,
} from '../types/plant';

export const getPlants = async (layerId: number): Promise<PlantsListResponseElement[]> => {
  return getPlantsFiltered(layerId, {});
};

export const getPlantSummary = async (layerId: number, maxEnteredTime: string): Promise<PlantSummary[]> => {
  const queryParams: PlantsSummaryQuery = { maxEnteredTime };

  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${plantsSummmaryEndpoint}`.replace('{layerId}', `${layerId}`);
  const response: PlantsSummaryResponse = (await axios.get(addQueryParams(endpoint, queryParams))).data;

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

export const putPlant = async (featureId: number, plant: PlantUpdateRequestBody): Promise<void> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${plantEndpoint}`.replace('{featureId}', `${featureId}`);
  await axios.put(endpoint, plant);
};

export const getPlantsFiltered = async (layerId: number, queryParams: PlantsListQuery): Promise<PlantsListResponseElement[]> => {
  const endpoint = `${process.env.REACT_APP_TERRAWARE_API}${plantsEndpoint}`.replace('{layerId}', `${layerId}`);

  const response: PlantsListResponse = (await axios.get(addQueryParams(endpoint, queryParams))).data;

  return response.list;
};
