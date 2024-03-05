import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response, Response2 } from 'src/services/HttpService';
import { Cohort, CreateCohortRequestPayload, UpdateCohortRequestPayload } from 'src/types/Cohort';

/**
 * Cohort related services
 */

const COHORTS_ENDPOINT = '/api/v1/accelerator/cohorts';
const COHORT_ENDPOINT = '/api/v1/accelerator/cohorts/{cohortId}';

export type ListCohortsResponsePayload =
  paths[typeof COHORTS_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type ListCohortsRequestDepth = paths[typeof COHORTS_ENDPOINT]['get']['parameters']['query']['depth'];

export type CreateCohortResponsePayload =
  paths[typeof COHORTS_ENDPOINT]['post']['responses'][200]['content']['application/json'];
export type GetCohortResponsePayload =
  paths[typeof COHORT_ENDPOINT]['get']['responses'][200]['content']['application/json'];
export type UpdateCohortResponsePayload =
  paths[typeof COHORT_ENDPOINT]['put']['responses'][200]['content']['application/json'];
export type DeleteCohortResponsePayload =
  paths[typeof COHORT_ENDPOINT]['delete']['responses'][200]['content']['application/json'];

const httpCohort = HttpService.root(COHORT_ENDPOINT);
const httpCohorts = HttpService.root(COHORTS_ENDPOINT);

/**
 * List all cohorts
 */
const listCohorts = async (
  locale: string | null,
  depth: ListCohortsRequestDepth = 'Cohort'
): Promise<Response2<Cohort[]>> =>
  httpCohorts.get<ListCohortsResponsePayload, { data: Cohort[] | undefined }>({ params: { depth } }, (response) => ({
    data: response?.cohorts?.sort((a, b) => a.name.localeCompare(b.name, locale || undefined)),
  }));

/**
 * Create a cohort
 */
const createCohort = (cohort: CreateCohortRequestPayload): Promise<Response> =>
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

const updateCohort = (cohortId: number, payload: UpdateCohortRequestPayload) =>
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
 * List module(s) for a cohort
 */
type MockModule = {
  id: number;
  name: string;
  description: string;
  duration: number;
  order: number;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
};

// TODO: remove mock data when BE is done
let mockResponseData: MockModule[] = [];

const listCohortModules = async (
  cohortId: number,
): Promise<Response2<MockModule[]>> =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: mockResponseData, requestSucceeded: true});
    }, 300);
  }
  );

/**
 * Exported functions
 */
const CohortService = {
  createCohort,
  deleteCohort,
  getCohort,
  listCohortModules,
  listCohorts,
  updateCohort,
};

export default CohortService;

// TODO: remove mock data once BE is done
mockResponseData = [
  {
    id: 1,
    name: 'Module 1',
    description: 'Module 1 description',
    duration: 3,
    order: 1,
    status: 'published',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: 'Module 2',
    description: 'Module 2 description',
    duration: 5,
    order: 2,
    status: 'published',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: 'Module 3',
    description: 'Module 3 description',
    duration: 7,
    order: 3,
    status: 'published',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },
  {
    id: 4,
    name: 'Module 4',
    description: 'Module 4 description',
    duration: 9,
    order: 4,
    status: 'published',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },
  {
    id: 5,
    name: 'Module 5',
    description: 'Module 5 description',
    duration: 11,
    order: 5,
    status: 'published',
    createdAt: '2021-01-01T00:00:00Z',
    updatedAt: '2021-01-01T00:00:00Z',
  },
];

