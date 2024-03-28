import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response, Response2, ServerData } from 'src/services/HttpService';
import SearchService from 'src/services/SearchService';
import { ParticipantProject, ParticipantProjectSearchResult } from 'src/types/ParticipantProject';
import { SearchNodePayload, SearchRequestPayload, SearchResponseElement, SearchSortOrder } from 'src/types/Search';

/**
 * Accelerator "participant project" related services
 */

export type ParticipantProjectsData = {
  projects: ParticipantProject[];
};

export type ParticipantProjectData = ServerData & {
  details: ParticipantProject | undefined;
};

const ENDPOINT_PARTICIPANT_PROJECT = '/api/v1/accelerator/projects/{projectId}';

type UpdateProjectAcceleratorDetailsRequestPayload =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT]['put']['requestBody']['content']['application/json'];
type UpdateProjectAcceleratorDetailsResponsePayload =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT]['put']['responses'][200]['content']['application/json'];

const httpParticipantProject = HttpService.root(ENDPOINT_PARTICIPANT_PROJECT);

const COHORT_ID_EXISTS_PREDICATE: SearchNodePayload = {
  operation: 'not',
  child: {
    operation: 'field',
    field: 'participant_cohort_id',
    values: [null],
  },
};

const getSearchParams = (
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder,
  isCsv?: boolean
): SearchRequestPayload => {
  const searchParams: SearchRequestPayload = {
    prefix: 'projects',
    fields: [
      'id',
      'name',
      'participant_name',
      'participant_cohort_id',
      'participant_cohort_name',
      'participant_cohort_phase',
      'country_name',
      'country_region',
      'acceleratorDetails_confirmedReforestableLand',
      ...(isCsv ? [] : ['acceleratorDetails_confirmedReforestableLand(raw)']),
      'landUseModelTypes.landUseModelType',
    ],
    search: {
      operation: 'and',
      children: search ? [search, COHORT_ID_EXISTS_PREDICATE] : [COHORT_ID_EXISTS_PREDICATE],
    },
    sortOrder: [sortOrder ?? { field: 'name' }],
    count: 0,
  };

  return searchParams;
};

const download = async (participantProjectId: number): Promise<string | null> => {
  return `Id,Project Name,Phase 1 Score\r${participantProjectId},Andromeda,0.5\r`;
};

const get = async (participantProjectId: number): Promise<Response2<ParticipantProjectData>> =>
  httpParticipantProject.get2<ParticipantProjectData>({
    urlReplacements: {
      '{projectId}': `${participantProjectId}`,
    },
  });

const downloadList = async (search?: SearchNodePayload, sortOrder?: SearchSortOrder): Promise<string | null> =>
  await SearchService.searchCsv(getSearchParams(search, sortOrder, true));

const list = async (
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<ParticipantProjectSearchResult[] | null> => {
  const response: SearchResponseElement[] | null = await SearchService.search(getSearchParams(search, sortOrder));

  if (!response) {
    return null;
  }

  return response.map((result: SearchResponseElement) => {
    const {
      id,
      name,
      participant_name,
      participant_cohort_id,
      participant_cohort_name,
      participant_cohort_phase,
      country_name,
      country_region,
      acceleratorDetails_confirmedReforestableLand,
    } = result;

    type LandUse = { landUseModelType: string };

    return {
      cohortName: participant_cohort_name,
      country: country_name,
      id: Number(id),
      landUseModelType: ((result.landUseModelTypes || []) as LandUse[]).map((type: LandUse) => type.landUseModelType),
      name,
      participant_cohort_id: Number(participant_cohort_id),
      participant_cohort_phase,
      participantName: participant_name,
      region: country_region,
      restorableLand: acceleratorDetails_confirmedReforestableLand,
      restorableLandRaw: Number(result['acceleratorDetails_confirmedReforestableLand(raw)']),
    } as ParticipantProjectSearchResult;
  });
};

const update = async (participantProject: ParticipantProject): Promise<Response> => {
  const { projectId, ...payload } = participantProject;

  return httpParticipantProject.put2<UpdateProjectAcceleratorDetailsResponsePayload>({
    urlReplacements: {
      '{projectId}': `${participantProject.projectId}`,
    },
    entity: payload as UpdateProjectAcceleratorDetailsRequestPayload,
  });
};

const ParticipantProjectsService = {
  download,
  downloadList,
  get,
  list,
  update,
};

export default ParticipantProjectsService;
