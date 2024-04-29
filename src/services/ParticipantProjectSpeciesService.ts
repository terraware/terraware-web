import { components } from 'src/api/types/generated-schema';

import { Response } from './HttpService';

export type ParticipantProjectSpecies = {
  feedback?: string;
  id: number;
  projectId: number;
  rationale?: string;
  speciesId: number;
  status: 'Not Submitted' | 'In Review' | 'Rejected' | 'Approved' | 'Needs Translation' | 'Not Needed';
};

export type ParticipantProjectSpeciesData = { participantProjectSpecies?: ParticipantProjectSpecies | undefined };

export type ParticipantProjectSpeciesResponse = Response & ParticipantProjectSpeciesData;

export type AllParticipantProjectSpeciesData = { participantProjectSpecies?: ParticipantProjectSpecies[] | undefined };

export type AllSpeciesResponse = Response & AllParticipantProjectSpeciesData;

export type UpdateParticipantProjectSpeciesData = { participantProjectSpecies?: ParticipantProjectSpecies | undefined };

export type UpdateParticipantProjectSpeciesResponse = Response & UpdateParticipantProjectSpeciesData;

export type DeleteParticipantProjectSpeciesResponse = components['schemas']['SimpleSuccessResponsePayload'];

// Record<projectId, ParticipantProjectSpecies[]>
const mockParticipantProjectSpecies: Record<number, ParticipantProjectSpecies[]> = {
  1: [
    {
      id: 1,
      projectId: 1,
      speciesId: 1,
      status: 'In Review',
    },
    {
      id: 2,
      projectId: 1,
      speciesId: 2,
      status: 'Not Submitted',
    },
  ],
  2: [
    {
      id: 3,
      projectId: 2,
      speciesId: 1,
      status: 'In Review',
    },
    {
      id: 4,
      projectId: 2,
      speciesId: 2,
      status: 'Not Submitted',
    },
  ],
};

const get = async (participantProjectSpeciesId: number): Promise<ParticipantProjectSpeciesResponse> => {
  return new Promise((resolve) => {
    let participantProjectSpecies;

    for (const speciesList of Object.values(mockParticipantProjectSpecies)) {
      const result = speciesList.find((ps) => ps.id === participantProjectSpeciesId);
      if (result) {
        participantProjectSpecies = result;
        break;
      }
    }

    resolve({ data: { participantProjectSpecies }, requestSucceeded: true });
  });
};

const list = async (projectId: number): Promise<AllSpeciesResponse> => {
  return new Promise((resolve) => {
    resolve({
      data: { participantProjectSpecies: mockParticipantProjectSpecies?.[projectId] || [] },
      requestSucceeded: true,
    });
  });
};

const update = async (
  projectId: number,
  participantProjectSpeciesId: number,
  participantProjectSpecies: ParticipantProjectSpecies
): Promise<UpdateParticipantProjectSpeciesResponse> => {
  return new Promise((resolve) => {
    const speciesList = mockParticipantProjectSpecies?.[projectId] || [];
    const index = speciesList.findIndex((ps) => ps.id === participantProjectSpeciesId);

    if (index !== -1) {
      speciesList[index] = participantProjectSpecies;
      mockParticipantProjectSpecies[projectId] = speciesList;
    }

    resolve({ data: { participantProjectSpecies }, requestSucceeded: true });
  });
};

const remove = async (
  projectId: number,
  participantProjectSpeciesId: number
): Promise<DeleteParticipantProjectSpeciesResponse> => {
  return new Promise((resolve) => {
    const speciesList = mockParticipantProjectSpecies?.[projectId] || [];
    const index = speciesList.findIndex((ps) => ps.id === participantProjectSpeciesId);

    if (index !== -1) {
      speciesList.splice(index, 1);
      mockParticipantProjectSpecies[projectId] = speciesList;
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
