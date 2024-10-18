import { paths } from '../api/types/generated-schema';
import HttpService, { Response } from './HttpService';

const ENDPOINT_NURSERY_FACILITY_SUMMARY = '/api/v1/nursery/facilities/{facilityId}/summary';
const ENDPOINT_ORGANIZATION_NURSERY_SUMMARY = '/api/v1/nursery/summary';

type GetNurserySummaryResponsePayload =
  paths[typeof ENDPOINT_NURSERY_FACILITY_SUMMARY]['get']['responses'][200]['content']['application/json'];
type GetOrganizationNurserySummaryResponsePayload =
  paths[typeof ENDPOINT_ORGANIZATION_NURSERY_SUMMARY]['get']['responses'][200]['content']['application/json'];

export type OrganizationNurserySummaryResponse = Response & OrganizationNurserySummaryPayload;
export type NurserySummaryPayload = GetNurserySummaryResponsePayload['summary'];
export type NurserySummarySpecies = NurserySummaryPayload['species'][0];
export type OrganizationNurserySummaryPayload = GetOrganizationNurserySummaryResponsePayload['summary'];

const httpNurseryFacilitySummary = HttpService.root(ENDPOINT_NURSERY_FACILITY_SUMMARY);
const httpOrganizationNurserySummary = HttpService.root(ENDPOINT_ORGANIZATION_NURSERY_SUMMARY);

const getNurserySummary = (nurseryId: number): Promise<Response & NurserySummaryPayload> =>
  httpNurseryFacilitySummary.get<GetNurserySummaryResponsePayload, NurserySummaryPayload | undefined>(
    {
      urlReplacements: {
        '{facilityId}': `${nurseryId}`,
      },
    },
    (response?: GetNurserySummaryResponsePayload) => response?.summary
  );

const getOrganizationNurserySummary = (organizationId: number): Promise<OrganizationNurserySummaryResponse> =>
  httpOrganizationNurserySummary.get<
    GetOrganizationNurserySummaryResponsePayload,
    OrganizationNurserySummaryPayload | undefined
  >(
    {
      params: {
        organizationId: organizationId.toString(),
      },
    },
    (response?: GetOrganizationNurserySummaryResponsePayload) => response?.summary
  );

/**
 * Exported functions
 */
const NurserySummaryService = {
  getNurserySummary,
  getOrganizationNurserySummary,
};

export default NurserySummaryService;
