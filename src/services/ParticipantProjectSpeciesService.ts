import { components } from 'src/api/types/generated-schema';

import { Response } from './HttpService';

export type ProjectSpecies = {
  deliverableId: number;
  id: number;
  projectId: number;
  speciesId: number;
};

export type ProjectSpeciesData = { projectSpecies?: ProjectSpecies | undefined };

export type ProjectSpeciesResponse = Response & ProjectSpeciesData;

export type AllProjectSpeciesData = { projectSpecies?: ProjectSpecies[] | undefined };

export type AllSpeciesResponse = Response & AllProjectSpeciesData;

export type UpdateProjectSpeciesData = { projectSpecies?: ProjectSpecies | undefined };

export type UpdateProjectSpeciesResponse = Response & UpdateProjectSpeciesData;

export type DeleteProjectSpeciesResponse = components['schemas']['SimpleSuccessResponsePayload'];

// Record<projectId, ProjectSpecies[]>
const mockProjectSpecies: Record<number, ProjectSpecies[]> = {
  1: [
    {
      deliverableId: 1,
      id: 1,
      projectId: 1,
      speciesId: 1,
    },
    {
      deliverableId: 1,
      id: 2,
      projectId: 1,
      speciesId: 2,
    },
  ],
  2: [
    {
      deliverableId: 1,
      id: 3,
      projectId: 2,
      speciesId: 1,
    },
    {
      deliverableId: 1,
      id: 4,
      projectId: 2,
      speciesId: 2,
    },
  ],
};

const get = async (projectId: number, projectSpeciesId: number): Promise<ProjectSpeciesResponse> => {
  return new Promise((resolve) => {
    const projectSpecies = mockProjectSpecies?.[projectId]?.find((ps) => ps.id === projectSpeciesId);
    resolve({ data: { projectSpecies }, requestSucceeded: true });
  });
};

const list = async (projectId: number): Promise<AllSpeciesResponse> => {
  return new Promise((resolve) => {
    resolve({ data: { projectSpecies: mockProjectSpecies?.[projectId] || [] }, requestSucceeded: true });
  });
};

const update = async (
  projectId: number,
  projectSpeciesId: number,
  projectSpecies: ProjectSpecies
): Promise<UpdateProjectSpeciesResponse> => {
  return new Promise((resolve) => {
    const projectSpeciesList = mockProjectSpecies?.[projectId] || [];
    const index = projectSpeciesList.findIndex((ps) => ps.id === projectSpeciesId);

    if (index !== -1) {
      projectSpeciesList[index] = projectSpecies;
      mockProjectSpecies[projectId] = projectSpeciesList;
    }

    resolve({ data: { projectSpecies }, requestSucceeded: true });
  });
};

const remove = async (projectId: number, projectSpeciesId: number): Promise<DeleteProjectSpeciesResponse> => {
  return new Promise((resolve) => {
    const projectSpeciesList = mockProjectSpecies?.[projectId] || [];
    const index = projectSpeciesList.findIndex((ps) => ps.id === projectSpeciesId);

    if (index !== -1) {
      projectSpeciesList.splice(index, 1);
      mockProjectSpecies[projectId] = projectSpeciesList;
    }

    resolve({ status: 'ok' });
  });
};

const ParticipantProjectSpeciesService = {
  get,
  list,
  update,
  remove,
};

export default ParticipantProjectSpeciesService;
