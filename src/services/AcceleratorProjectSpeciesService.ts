import { paths } from 'src/api/types/generated-schema';
import { AcceleratorProjectSpecies } from 'src/types/AcceleratorProjectSpecies';

import HttpService, { Response2 } from './HttpService';
import axios from './axios';

const ENDPOINT_ACCELERATOR_PROJECT_SPECIES_SINGULAR =
  '/api/v1/accelerator/projects/species/{participantProjectSpeciesId}';
const ENDPOINT_ACCELERATOR_PROJECT_SPECIES = '/api/v1/accelerator/projects/species';
const ENDPOINT_ACCELERATOR_PROJECT_SPECIES_SUBMISSION_SNAPSHOT =
  '/api/v1/accelerator/projects/{projectId}/species/snapshots/{deliverableId}';
const ENDPOINT_ACCELERATOR_PROJECTS_FOR_SPECIES = '/api/v1/accelerator/species/{speciesId}/projects';
const ENDPOINT_PARTICIPANT_SPECIES_FOR_PROJECT = '/api/v1/accelerator/projects/{projectId}/species';

export type CreateAcceleratorProjectSpeciesRequestPayload =
  paths[typeof ENDPOINT_ACCELERATOR_PROJECT_SPECIES]['post']['requestBody']['content']['application/json'];
type CreateResponse =
  paths[typeof ENDPOINT_ACCELERATOR_PROJECT_SPECIES]['post']['responses'][200]['content']['application/json'];

type DeleteRequestPayload =
  paths[typeof ENDPOINT_ACCELERATOR_PROJECT_SPECIES]['delete']['requestBody']['content']['application/json'];
type DeleteResponse =
  paths[typeof ENDPOINT_ACCELERATOR_PROJECT_SPECIES]['delete']['responses'][200]['content']['application/json'];

type GetResponse =
  paths[typeof ENDPOINT_ACCELERATOR_PROJECT_SPECIES_SINGULAR]['get']['responses'][200]['content']['application/json'];

type GetProjectsForSpeciesResponse =
  paths[typeof ENDPOINT_ACCELERATOR_PROJECTS_FOR_SPECIES]['get']['responses'][200]['content']['application/json'];

type GetSpeciesForProjectResponse =
  paths[typeof ENDPOINT_PARTICIPANT_SPECIES_FOR_PROJECT]['get']['responses'][200]['content']['application/json'];

type GetSubmissionSnapshotResponse =
  paths[typeof ENDPOINT_ACCELERATOR_PROJECT_SPECIES_SUBMISSION_SNAPSHOT]['get']['responses'][200]['content']['*/*'];

export type UpdateRequestPayload =
  paths[typeof ENDPOINT_ACCELERATOR_PROJECT_SPECIES_SINGULAR]['put']['requestBody']['content']['application/json'];
type UpdateResponse =
  paths[typeof ENDPOINT_ACCELERATOR_PROJECT_SPECIES_SINGULAR]['put']['responses'][200]['content']['application/json'];

const create = async (request: CreateAcceleratorProjectSpeciesRequestPayload): Promise<Response2<CreateResponse>> =>
  HttpService.root(ENDPOINT_ACCELERATOR_PROJECT_SPECIES).post2<CreateResponse>({
    entity: request,
  });

const deleteMany = (acceleratorProjectSpeciesIds: number[]): Promise<Response2<DeleteResponse>> => {
  const entity: DeleteRequestPayload = { participantProjectSpeciesIds: acceleratorProjectSpeciesIds };

  return HttpService.root(ENDPOINT_ACCELERATOR_PROJECT_SPECIES).delete2<DeleteResponse>({
    entity,
  });
};

const downloadSnapshot = async (
  deliverableId: number,
  projectId: number
): Promise<GetSubmissionSnapshotResponse | undefined> => {
  try {
    const result = await axios.get<GetSubmissionSnapshotResponse>(
      ENDPOINT_ACCELERATOR_PROJECT_SPECIES_SUBMISSION_SNAPSHOT.replace('{projectId}', `${projectId}`).replace(
        '{deliverableId}',
        `${deliverableId}`
      )
    );
    return result.data;
  } catch (e) {
    return undefined;
  }
};

const get = (acceleratorProjectSpeciesId: number): Promise<Response2<GetResponse>> =>
  HttpService.root(ENDPOINT_ACCELERATOR_PROJECT_SPECIES_SINGULAR).get2<GetResponse>({
    urlReplacements: {
      '{participantProjectSpeciesId}': `${acceleratorProjectSpeciesId}`,
    },
  });

const getProjectsForSpecies = (speciesId: number): Promise<Response2<GetProjectsForSpeciesResponse>> =>
  HttpService.root(ENDPOINT_ACCELERATOR_PROJECTS_FOR_SPECIES).get2<GetProjectsForSpeciesResponse>({
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

const update = (acceleartorProjectSpecies: AcceleratorProjectSpecies): Promise<Response2<UpdateResponse>> => {
  const entity: UpdateRequestPayload = {
    feedback: acceleartorProjectSpecies.feedback,
    internalComment: acceleartorProjectSpecies.internalComment,
    speciesNativeCategory: acceleartorProjectSpecies.speciesNativeCategory,
    rationale: acceleartorProjectSpecies.rationale,
    submissionStatus: acceleartorProjectSpecies.submissionStatus,
  };

  return HttpService.root(ENDPOINT_ACCELERATOR_PROJECT_SPECIES_SINGULAR).put2<UpdateResponse>({
    urlReplacements: {
      '{participantProjectSpeciesId}': `${acceleartorProjectSpecies.id}`,
    },
    entity,
  });
};

const AcceleratorProjectSpeciesService = {
  create,
  deleteMany,
  downloadSnapshot,
  get,
  getProjectsForSpecies,
  list,
  update,
};

export default AcceleratorProjectSpeciesService;
