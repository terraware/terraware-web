import { paths } from 'src/api/types/generated-schema';
import { ParticipantProjectSpecies, SubmissionStatus } from 'src/types/ParticipantProjectSpecies';
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

export type SpeciesProjectsResult = {
  id: number;
  submissionStatus: string;
  projectName: string;
  projectId: number;
};

type SpeciesProjectsSearchResult = {
  participantProjectSpecies: { id: number; submissionStatus: string; project: { name: string; id: number } }[];
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
    internalComment: participantProjectSpecies.internalComment,
    nativeNonNative: participantProjectSpecies.nativeNonNative,
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
  const searchParams: SearchRequestPayload = {
    prefix: 'species',
    fields: [
      'participantProjectSpecies.id',
      'participantProjectSpecies.project.name',
      'participantProjectSpecies.project.id',
      'participantProjectSpecies.submissionStatus',
    ],
    search: {
      operation: 'and',
      children: [
        {
          operation: 'field',
          field: 'organization_id',
          type: 'Exact',
          values: [organizationId],
        },
        {
          operation: 'field',
          field: 'id',
          type: 'Exact',
          values: [speciesId],
        },
      ],
    },
    count: 1000,
  };

  const apiSearchResults = (await SearchService.search(searchParams)) as SpeciesProjectsSearchResult[];
  // it will always be one result since we are searching by species id
  const firstApiResult = apiSearchResults[0];
  const projects = firstApiResult?.participantProjectSpecies.map((pps) => {
    return {
      submissionStatus: pps.submissionStatus,
      projectName: pps.project.name,
      projectId: pps.project.id,
      id: pps.id,
    } as SpeciesProjectsResult;
  });

  return projects;
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
