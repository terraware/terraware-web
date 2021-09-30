import { components, operations } from './generated-schema';

export type ListPlantsResponsePayload =
  components['schemas']['ListPlantsResponsePayload'];
export type ListPlantsResponseElement =
  components['schemas']['ListPlantsResponseElement'];
export type SearchOptions = operations['getPlantsList']['parameters']['query'];

export type PlantSummaryResponsePayload =
  components['schemas']['PlantSummaryResponsePayload'];

export type UpdatePlantRequestPayload =
  components['schemas']['UpdatePlantRequestPayload'];
export type UpdatePlantResponsePayload =
  components['schemas']['UpdatePlantResponsePayload'];
export type PlantResponse = components['schemas']['PlantResponse'];

export type PlantSummary = { speciesId: number; count: number };
