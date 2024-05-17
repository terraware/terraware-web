import { DateTime } from 'luxon';

import { components, paths } from 'src/api/types/generated-schema';
import { DeliverableTypeType, getDeliverableTypeLabel } from 'src/types/Deliverables';
import { SearchNodePayload, SearchRequestPayload, SearchSortOrder } from 'src/types/Search';

import HttpService, { Response2 } from './HttpService';
import SearchService from './SearchService';

const ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SINGULAR =
  '/api/v1/accelerator/projects/species/{participantProjectSpeciesId}';
const ENDPOINT_PARTICIPANT_PROJECT_SPECIES = '/api/v1/accelerator/projects/species';
const ENDPOINT_PARTICIPANT_PROJECT_SPECIES_ASSIGN = '/api/v1/accelerator/projects/species/assign';

type AssignRequestPayload =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES_ASSIGN]['post']['requestBody']['content']['application/json'];
type AssignResponse =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES_ASSIGN]['post']['responses'][200]['content']['application/json'];

export type CreateParticipantProjectSpeciesRequestPayload =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES]['post']['requestBody']['content']['application/json'];
type CreateResponse =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES]['post']['responses'][200]['content']['application/json'];

type DeleteRequestPayload =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES]['delete']['requestBody']['content']['application/json'];
type DeleteResponse =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES]['delete']['responses'][200]['content']['application/json'];

type GetResponse =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SINGULAR]['get']['responses'][200]['content']['application/json'];

export type UpdateRequestPayload =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SINGULAR]['put']['requestBody']['content']['application/json'];
type UpdateResponse =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SINGULAR]['put']['responses'][200]['content']['application/json'];

export type ParticipantProjectSpecies = components['schemas']['ParticipantProjectSpeciesPayload'];
export type SubmissionStatus = ParticipantProjectSpecies['submissionStatus'];

export type SpeciesProjectsResult = {
  id: number;
  submissionStatus: string;
  projectName: string;
  projectId: number;
  deliverableId?: number;
};

type SpeciesProjectsSearchResult = {
  // Deliverable ID
  id: string;
  module: {
    cohortModules: {
      startDate: string;
      endDate: string;
    }[];
  };
  project: {
    participantProjectSpecies: {
      id: string;
      project: {
        name: string;
        id: string;
      };
      species: {
        id: string;
        organization: {
          id: string;
        };
      };
      submissionStatus: string;
    }[];
  };
  type: string;
};

export type SpeciesWithParticipantProjectsSearchResponse = {
  commonName?: string;
  feedback?: string;
  id: number;
  projectId: number;
  rationale?: string;
  scientificName?: string;
  speciesId: number;
  submissionStatus: SubmissionStatus;
};

const assign = async (projectIds: number[], speciesIds: number[]): Promise<Response2<AssignResponse>> => {
  const entity: AssignRequestPayload = { projectIds, speciesIds };

  return HttpService.root(ENDPOINT_PARTICIPANT_PROJECT_SPECIES_ASSIGN).post2<AssignResponse>({
    entity,
  });
};

const create = async (request: CreateParticipantProjectSpeciesRequestPayload): Promise<Response2<CreateResponse>> =>
  HttpService.root(ENDPOINT_PARTICIPANT_PROJECT_SPECIES).post2<CreateResponse>({
    entity: request,
  });

const deleteMany = (participantProjectSpeciesIds: number[]): Promise<Response2<DeleteResponse>> => {
  const entity: DeleteRequestPayload = { participantProjectSpeciesIds };

  return HttpService.root(ENDPOINT_PARTICIPANT_PROJECT_SPECIES).delete2<DeleteResponse>({
    entity,
  });
};

const get = (participantProjectSpeciesId: number): Promise<Response2<GetResponse>> =>
  HttpService.root(ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SINGULAR).get2<GetResponse>({
    urlReplacements: {
      '{participantProjectSpeciesId}': `${participantProjectSpeciesId}`,
    },
  });

const list = async (
  projectId: number,
  searchCriteria?: SearchNodePayload,
  sortOrder?: SearchSortOrder
): Promise<SpeciesWithParticipantProjectsSearchResponse[] | null> => {
  const params: SearchRequestPayload = {
    prefix: 'species',
    fields: [
      'id',
      'commonName',
      'participantProjectSpecies_project_id',
      'participantProjectSpecies_id',
      'participantProjectSpecies_feedback',
      'participantProjectSpecies_rationale',
      'participantProjectSpecies_submissionStatus',
      'scientificName',
    ],
    search: {
      operation: 'and',
      children: [
        {
          field: 'participantProjectSpecies_project_id',
          values: [`${projectId}`],
          operation: 'field',
        },
        ...(searchCriteria ? [searchCriteria] : []),
      ],
    },
    count: 1000,
  };

  if (sortOrder) {
    params.sortOrder = [sortOrder];
  }

  const response = await SearchService.search(params);
  if (!response) {
    return response;
  }

  return response.map((entity) => {
    const searchResponse: SpeciesWithParticipantProjectsSearchResponse = {
      commonName: entity.commonName ? `${entity.commonName}` : undefined,
      feedback: entity.participantProjectSpecies_feedback ? `${entity.participantProjectSpecies_feedback}` : undefined,
      id: Number(entity.participantProjectSpecies_id),
      projectId: Number(entity.participantProjectSpecies_project_id),
      rationale: entity.participantProjectSpecies_rationale
        ? `${entity.participantProjectSpecies_rationale}`
        : undefined,
      scientificName: entity.scientificName ? `${entity.scientificName}` : undefined,
      speciesId: Number(entity.id),
      submissionStatus: `${entity.participantProjectSpecies_submissionStatus}` as SubmissionStatus,
    };

    return searchResponse;
  });
};

const update = (participantProjectSpecies: ParticipantProjectSpecies): Promise<Response2<UpdateResponse>> => {
  const entity: UpdateRequestPayload = {
    feedback: participantProjectSpecies.feedback,
    rationale: participantProjectSpecies.rationale,
    submissionStatus: participantProjectSpecies.submissionStatus,
  };

  return HttpService.root(ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SINGULAR).put2<UpdateResponse>({
    urlReplacements: {
      '{participantProjectSpeciesId}': `${participantProjectSpecies.id}`,
    },
    entity,
  });
};

const getProjectsForSpecies = async (speciesId: number, organizationId: number): Promise<SpeciesProjectsResult[]> => {
  const todayUTC = DateTime.fromISO(new Date().toISOString()).toFormat('yyyy-MM-dd');
  console.log('todayUTC', todayUTC);
  const searchParams: SearchRequestPayload = {
    prefix: 'projects.projectDeliverables',
    fields: [
      'id',
      'type',
      'project.participantProjectSpecies.id',
      'project.participantProjectSpecies.project.name',
      'project.participantProjectSpecies.project.id',
      'project.participantProjectSpecies.species.id',
      'project.participantProjectSpecies.species.organization.id',
      'project.participantProjectSpecies.submissionStatus',
      'module.cohortModules.startDate',
      'module.cohortModules.endDate',
    ],
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'type',
          type: 'Exact',
          values: [getDeliverableTypeLabel('Species' as DeliverableTypeType)],
        },
        {
          operation: 'field',
          field: 'project.participantProjectSpecies.species.organization.id',
          type: 'Exact',
          values: [organizationId],
        },
        {
          operation: 'field',
          field: 'project.participantProjectSpecies.species.id',
          type: 'Exact',
          values: [speciesId],
        },
        {
          operation: 'field',
          field: 'module.cohortModules.endDate',
          type: 'Range',
          values: [todayUTC, null],
        },
        {
          operation: 'field',
          field: 'module.cohortModules.startDate',
          type: 'Range',
          values: [null, todayUTC],
        },
      ],
    },
    count: 1000,
  };

  const apiSearchResults = await SearchService.search<SpeciesProjectsSearchResult>(searchParams);

  return apiSearchResults
    ? apiSearchResults.flatMap((result: SpeciesProjectsSearchResult): SpeciesProjectsResult[] =>
        result.project.participantProjectSpecies.map(
          (pps: SpeciesProjectsSearchResult['project']['participantProjectSpecies'][0]): SpeciesProjectsResult => ({
            submissionStatus: pps.submissionStatus,
            projectName: pps.project.name,
            projectId: Number(pps.project.id),
            id: Number(pps.species.id),
            deliverableId: Number(result.id),
          })
        )
      )
    : [];
};

const ParticipantProjectSpeciesService = {
  assign,
  create,
  get,
  list,
  update,
  deleteMany,
  getProjectsForSpecies,
};

export default ParticipantProjectSpeciesService;
