import { paths } from '../api/types/generated-schema';
import HttpService, { Response } from './HttpService';

const ENDPOINT_NURSERY_FACILITY_SUMMARY = '/api/v1/nursery/facilities/{facilityId}/summary';

type GetNurserySummaryResponsePayload =
  paths[typeof ENDPOINT_NURSERY_FACILITY_SUMMARY]['get']['responses'][200]['content']['application/json'];

export type NurserySummaryPayload = GetNurserySummaryResponsePayload['summary'];
export type NurserySummarySpecies = NurserySummaryPayload['species'][0];

const httpNurseryFacilitySummary = HttpService.root(ENDPOINT_NURSERY_FACILITY_SUMMARY);

const getNurserySummary = (nurseryId: number): Promise<Response & NurserySummaryPayload> =>
  httpNurseryFacilitySummary.get<GetNurserySummaryResponsePayload, NurserySummaryPayload | undefined>(
    {
      urlReplacements: {
        '{facilityId}': `${nurseryId}`,
      },
    },
    (response?: GetNurserySummaryResponsePayload) => response?.summary
  );

/**
 * Exported functions
 */
const NurseryFacilitiesService = {
  getNurserySummary,
};

export default NurseryFacilitiesService;
