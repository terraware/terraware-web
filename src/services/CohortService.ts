import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response, Response2 } from 'src/services/HttpService';
import { CreateCohortRequest, Cohort, UpdateCohortRequest } from 'src/types/Cohort';

/**
 * Cohorts related services
 */

const COHORTS_ENDPOINT = '/api/v1/accelerator/cohorts';
const COHORT_ENDPOINT = '/api/v1/accelerator/cohorts/{cohortId}';

type ListCohortsResponsePayload =
  paths[typeof COHORTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];

type GetCohortResponsePayload = paths[typeof COHORT_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type UpdateCohortResponsePayload =
  paths[typeof COHORT_ENDPOINT]['put']['responses'][200]['content']['application/json'];
export type DeleteCohortResponsePayload =
  paths[typeof COHORT_ENDPOINT]['delete']['responses'][200]['content']['application/json'];

/**
 * exported type
 */
export type CohortsData = {
  cohorts?: Cohort[];
};

const httpCohort = HttpService.root(COHORT_ENDPOINT);
const httpCohorts = HttpService.root(COHORTS_ENDPOINT);

/**
 * List all cohorts
 */
const listCohorts = async (organizationId: number, locale?: string | null): Promise<CohortsData & Response> => {
  const response: CohortsData & Response = await httpCohorts.get<ListCohortsResponsePayload, CohortsData>(
    {
      params: {
        organizationId: organizationId.toString(),
      },
    },
    (data) => ({
      cohorts: data?.cohorts.sort((a, b) => a.name.localeCompare(b.name, locale || undefined)),
    })
  );

  return response;
};

/**
 * Create a cohort
 */
const createCohort = (cohort: CreateCohortRequest): Promise<Response> =>
  httpCohorts.post({
    entity: cohort,
  });

const getCohort = (cohortId: number): Promise<Response2<Cohort>> =>
  httpCohort.get<GetCohortResponsePayload, { data: Cohort | undefined }>(
    {
      url: COHORT_ENDPOINT,
      urlReplacements: { '{cohortId}': `${cohortId}` },
    },
    (response) => ({ data: response?.cohort })
  );

const updateCohort = (cohortId: number, payload: UpdateCohortRequest) =>
  httpCohort.put2<UpdateCohortResponsePayload>({
    url: COHORT_ENDPOINT,
    urlReplacements: { '{cohortId}': `${cohortId}` },
    entity: payload,
  });

const deleteCohort = (cohortId: number) =>
  httpCohort.delete2<DeleteCohortResponsePayload>({
    url: COHORT_ENDPOINT,
    urlReplacements: { '{cohortId}': `${cohortId}` },
  });

/**
 * Exported functions
 */
const CohortService = {
  listCohorts,
  createCohort,
  getCohort,
  updateCohort,
  deleteCohort,
};

export default CohortService;
