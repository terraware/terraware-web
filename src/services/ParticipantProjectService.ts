import { paths } from 'src/api/types/generated-schema';
import HttpService, { Response, Response2, ServerData } from 'src/services/HttpService';
import SearchService from 'src/services/SearchService';
import strings from 'src/strings';
import { AcceleratorOrg } from 'src/types/Accelerator';
import { ParticipantProject } from 'src/types/ParticipantProject';
import { Project, ProjectMeta } from 'src/types/Project';
import { Score } from 'src/types/Score';
import { SearchNodePayload, SearchRequestPayload, SearchSortOrder } from 'src/types/Search';
import { PhaseVotes } from 'src/types/Votes';
import { SearchOrderConfig, searchAndSort } from 'src/utils/searchAndSort';

/**
 * Accelerator "participant project" related services
 */

export type ParticipantProjectsData = {
  projects: ParticipantProject[];
};

export type ParticipantProjectData = ServerData & {
  details: ParticipantProject | undefined;
};

const ENDPOINT_PARTICIPANT_PROJECTS = '/api/v1/accelerator/projects';
const ENDPOINT_PARTICIPANT_PROJECT = '/api/v1/accelerator/projects/{projectId}';

type UpdateProjectAcceleratorDetailsRequestPayload =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT]['put']['requestBody']['content']['application/json'];
type UpdateProjectAcceleratorDetailsResponsePayload =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT]['put']['responses'][200]['content']['application/json'];

type ListProjectAcceleratorDetailsResponsePayload =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECTS]['get']['responses'][200]['content']['application/json'];

const httpParticipantProjects = HttpService.root(ENDPOINT_PARTICIPANT_PROJECTS);
const httpParticipantProject = HttpService.root(ENDPOINT_PARTICIPANT_PROJECT);

const COHORT_ID_EXISTS_PREDICATE: SearchNodePayload = {
  operation: 'not',
  child: {
    operation: 'field',
    field: 'cohort_id',
    values: [null],
  },
};

const getSearchParams = (search?: SearchNodePayload, sortOrder?: SearchSortOrder): SearchRequestPayload => {
  const searchParams: SearchRequestPayload = {
    prefix: 'projects',
    fields: [
      'id',
      'name',
      'cohort_id',
      'cohort_name',
      'cohort_phase',
      'acceleratorDetails_fileNaming',
      'country_name',
      'country_region',
      'acceleratorDetails_confirmedReforestableLand',
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

const download = async ({
  participantProject,
  phaseVotes,
  project,
  projectId,
  projectMeta,
  projectScore,
  organization,
}: {
  participantProject?: ParticipantProject;
  phaseVotes?: PhaseVotes;
  project?: Project;
  projectId: number;
  projectMeta?: ProjectMeta;
  projectScore?: Score;
  organization?: AcceleratorOrg;
  // eslint-disable-next-line @typescript-eslint/require-await
}): Promise<string | null> => {
  const exportData = new Map<string, string | number | null | undefined>([
    [strings.ORGANIZATION_NAME, organization?.name],
    [strings.PROJECT_ID, projectId],
    [strings.PROJECT_NAME, project?.name],
    [strings.PHASE_1_SCORE, projectScore?.overallScore],
    [strings.VOTING_DECISION, phaseVotes?.decision],
    [strings.FILE_NAMING, participantProject?.fileNaming],
    [strings.COUNTRY, participantProject?.countryCode],
    [strings.REGION, participantProject?.region],
    [strings.LAND_USE_MODEL_TYPE, (participantProject?.landUseModelTypes || []).join(', ')],
    [strings.NUMBER_OF_NATIVE_SPECIES, participantProject?.numNativeSpecies],
    [strings.APPLICATION_RESTORABLE_LAND, participantProject?.applicationReforestableLand],
    [strings.CONFIRMED_RESTORABLE_LAND, participantProject?.confirmedReforestableLand],
    [strings.TOTAL_EXPANSION_POTENTIAL, participantProject?.totalExpansionPotential],
    [strings.MINIMUM_CARBON_ACCUMULATION, participantProject?.minCarbonAccumulation],
    [strings.MAXIMUM_CARBON_ACCUMULATION, participantProject?.maxCarbonAccumulation],
    [strings.PER_HECTARE_ESTIMATED_BUDGET, participantProject?.perHectareBudget],
    [strings.NUMBER_OF_COMMUNITIES_WITHIN_PROJECT_AREA, participantProject?.numCommunities],
    [strings.CREATED_ON, project?.createdTime],
    [strings.CREATED_BY, projectMeta?.createdByUserName],
    [strings.LAST_MODIFIED_ON, project?.modifiedTime],
    [strings.LAST_MODIFIED_BY, projectMeta?.modifiedByUserName],
  ]);

  const headersRow = Array.from(exportData.keys()).join(',');
  // Wrap each value in double quotes and escape double quotes to handle values with commas
  const valuesRow = `"${Array.from(exportData.values())
    .map((value) => ([undefined, null].includes(value as null | undefined) ? '' : `${value}`.replace(/"/g, '""')))
    .join('","')}"`;
  return `${headersRow}\r${valuesRow}\r`;
};

const get = async (participantProjectId: number): Promise<Response2<ParticipantProjectData>> =>
  httpParticipantProject.get2<ParticipantProjectData>({
    urlReplacements: {
      '{projectId}': `${participantProjectId}`,
    },
  });

const downloadList = async (search?: SearchNodePayload, sortOrder?: SearchSortOrder): Promise<string | null> =>
  await SearchService.searchCsv(getSearchParams(search, sortOrder));

const list = async (
  locale?: string,
  search?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<ListProjectAcceleratorDetailsResponsePayload> => {
  let searchOrderConfig: SearchOrderConfig | undefined;
  if (sortOrder) {
    searchOrderConfig = {
      locale: locale ?? null,
      sortOrder,
      numberFields: ['id'],
    };
  }

  const response = await httpParticipantProjects.get2<ListProjectAcceleratorDetailsResponsePayload>();

  if (!response || !response.requestSucceeded || !response.data) {
    return Promise.reject(response);
  }

  return {
    status: response.data.status,
    details: searchAndSort(response.data.details, search, searchOrderConfig),
  };
};

const update = async (participantProject: ParticipantProject): Promise<Response> => {
  const { projectId, ...payload } = participantProject;

  return httpParticipantProject.put2<UpdateProjectAcceleratorDetailsResponsePayload>({
    urlReplacements: {
      '{projectId}': `${projectId}`,
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
