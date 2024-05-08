import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { requestListParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesListRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';
import { Deliverable } from 'src/types/Deliverables';

import { useProjectData } from '../Project/ProjectContext';
import { ParticipantProjectSpeciesContext, ParticipantProjectSpeciesData } from './ParticipantProjectSpeciesContext';

export type Props = {
  children: React.ReactNode;
};

const ParticipantProjectSpeciesProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();

  const { projectId } = useProjectData();

  const [currentParticipantProjectSpecies, setCurrentParticipantProjectSpecies] = useState<ParticipantProjectSpecies>();
  const [currentDeliverable, setCurrentDeliverable] = useState<Deliverable>();
  const participantProjectSpeciesApi = useAppSelector(selectParticipantProjectSpeciesListRequest(projectId || -1));
  const participantProjectSpecies = useMemo(() => {
    return participantProjectSpeciesApi?.data;
  }, [participantProjectSpeciesApi]);

  const _setCurrentParticipantProjectSpecies = useCallback(
    (projectSpeciesId: string | number) => {
      if (participantProjectSpecies) {
        setCurrentParticipantProjectSpecies(
          participantProjectSpecies.find((projectSpecies) => projectSpecies.id === Number(projectSpeciesId))
        );
      }
    },
    [participantProjectSpecies]
  );

  const _setCurrentDeliverable = (deliverable: Deliverable) => {
    setCurrentDeliverable(deliverable);
  };

  const [participantProjectSpeciesData, setParticipantProjectSpeciesData] = useState<ParticipantProjectSpeciesData>({
    participantProjectSpecies: [],
    currentDeliverable,
    setCurrentDeliverable: _setCurrentDeliverable,
    setCurrentParticipantProjectSpecies: _setCurrentParticipantProjectSpecies,
  });
  useEffect(() => {
    if (projectId) {
      dispatch(requestListParticipantProjectSpecies(projectId));
    }
  }, [projectId]);

  useEffect(() => {
    if (currentDeliverable) {
      setParticipantProjectSpeciesData(
        (previousRecord: ParticipantProjectSpeciesData): ParticipantProjectSpeciesData => {
          return {
            ...previousRecord,
            currentDeliverable,
          };
        }
      );
    }
  }, [currentDeliverable]);

  useEffect(() => {
    if (currentParticipantProjectSpecies) {
      setParticipantProjectSpeciesData(
        (previousRecord: ParticipantProjectSpeciesData): ParticipantProjectSpeciesData => {
          return {
            ...previousRecord,
            currentParticipantProjectSpecies,
          };
        }
      );
    }
  }, [currentParticipantProjectSpecies]);

  useEffect(() => {
    if (participantProjectSpecies && participantProjectSpecies.length > 0) {
      setParticipantProjectSpeciesData(
        (previousRecord: ParticipantProjectSpeciesData): ParticipantProjectSpeciesData => {
          return {
            ...previousRecord,
            participantProjectSpecies,
          };
        }
      );
    }
  }, [participantProjectSpecies]);

  return (
    <ParticipantProjectSpeciesContext.Provider value={participantProjectSpeciesData}>
      {children}
    </ParticipantProjectSpeciesContext.Provider>
  );
};

export default ParticipantProjectSpeciesProvider;
