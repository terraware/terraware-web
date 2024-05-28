import { paths } from 'src/api/types/generated-schema';
import { ParticipantProjectSpecies, SubmissionStatus } from 'src/types/ParticipantProjectSpecies';

import HttpService, { Response2 } from './HttpService';
import axios from './axios';

const ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SINGULAR =
  '/api/v1/accelerator/projects/species/{participantProjectSpeciesId}';
const ENDPOINT_PARTICIPANT_PROJECT_SPECIES = '/api/v1/accelerator/projects/species';
const ENDPOINT_PARTICIPANT_PROJECT_SPECIES_ASSIGN = '/api/v1/accelerator/projects/species/assign';
const ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SUBMISSION_SNAPSHOT =
  '/api/v1/accelerator/projects/{projectId}/species/snapshots/{deliverableId}';
const ENDPOINT_PARTICIPANT_PROJECTS_FOR_SPECIES = '/api/v1/accelerator/species/{speciesId}/projects';
const ENDPOINT_PARTICIPANT_SPECIES_FOR_PROJECT = '/api/v1/accelerator/projects/{projectId}/species';

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

type GetProjectsForSpeciesResponse =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECTS_FOR_SPECIES]['get']['responses'][200]['content']['application/json'];

type GetSpeciesForProjectResponse =
  paths[typeof ENDPOINT_PARTICIPANT_SPECIES_FOR_PROJECT]['get']['responses'][200]['content']['application/json'];

type GetSubmissionSnapshotResponse =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SUBMISSION_SNAPSHOT]['get']['responses'][200]['content']['*/*'];

export type UpdateRequestPayload =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SINGULAR]['put']['requestBody']['content']['application/json'];
type UpdateResponse =
  paths[typeof ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SINGULAR]['put']['responses'][200]['content']['application/json'];

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

const downloadSnapshot = async (
  deliverableId: number,
  projectId: number
): Promise<GetSubmissionSnapshotResponse | undefined> => {
  try {
    const result = await axios.get<GetSubmissionSnapshotResponse>(
      ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SUBMISSION_SNAPSHOT.replace('{projectId}', `${projectId}`).replace(
        '{deliverableId}',
        `${deliverableId}`
      )
    );
    return result.data;
  } catch (e) {
    return undefined;
  }
};

const get = (participantProjectSpeciesId: number): Promise<Response2<GetResponse>> =>
  HttpService.root(ENDPOINT_PARTICIPANT_PROJECT_SPECIES_SINGULAR).get2<GetResponse>({
    urlReplacements: {
      '{participantProjectSpeciesId}': `${participantProjectSpeciesId}`,
    },
  });

const getProjectsForSpecies = (speciesId: number): Promise<Response2<GetProjectsForSpeciesResponse>> =>
  HttpService.root(ENDPOINT_PARTICIPANT_PROJECTS_FOR_SPECIES).get2<GetProjectsForSpeciesResponse>({
    urlReplacements: {
      '{speciesId}': `${speciesId}`,
    },
  });

const list = (projectId: number): Promise<Response2<GetSpeciesForProjectResponse>> =>
  HttpService.root(ENDPOINT_PARTICIPANT_SPECIES_FOR_PROJECT).get2<GetSpeciesForProjectResponse>({
    urlReplacements: {
      '{projectId}': `${projectId}`,
    },
  });

const update = (participantProjectSpecies: ParticipantProjectSpecies): Promise<Response2<UpdateResponse>> => {
  const entity: UpdateRequestPayload = {
    feedback: participantProjectSpecies.feedback,
    internalComment: participantProjectSpecies.internalComment,
    speciesNativeCategory: participantProjectSpecies.speciesNativeCategory,
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

const ParticipantProjectSpeciesService = {
  assign,
  create,
  deleteMany,
  downloadSnapshot,
  get,
  getProjectsForSpecies,
  list,
  update,
};

export default ParticipantProjectSpeciesService;
