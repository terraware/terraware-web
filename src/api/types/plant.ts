import { paths } from './generated-schema';

export const plantsEndpoint = '/api/v1/gis/plants/list/{layerId}';
export type PlantsListQuery = paths[typeof plantsEndpoint]['get']['parameters']['query'];
export type PlantsListResponse = paths[typeof plantsEndpoint]['get']['responses'][200]['content']['application/json'];
export type PlantsListResponseElement = PlantsListResponse['list'][0];

export const plantsSummmaryEndpoint = '/api/v1/gis/plants/list/summary/{layerId}';
export type PlantsSummaryQuery = paths[typeof plantsSummmaryEndpoint]['get']['parameters']['query'];
export type PlantsSummaryResponse = paths[typeof plantsSummmaryEndpoint]['get']['responses'][200]['content']['application/json'];

export type PlantSummary = { speciesId: number; count: number };

export const plantEndpoint = '/api/v1/gis/plants/{featureId}';
export type PlantUpdateRequestBody = paths[typeof plantEndpoint]['put']['requestBody']['content']['application/json'];
