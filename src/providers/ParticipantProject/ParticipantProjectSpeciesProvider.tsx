import React, { useCallback, useEffect, useState } from 'react';

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
  const participantProjectSpeciesApi = useAppSelector(selectParticipantProjectSpeciesListRequest(projectId));

  const reload = useCallback(() => {
    void dispatch(requestListParticipantProjectSpecies(projectId));
  }, [dispatch, projectId]);

  useEffect(() => {
    if (currentParticipantProjectSpecies) {
      _setCurrentParticipantProjectSpecies(currentParticipantProjectSpecies?.id);
    }
  }, [participantProjectSpeciesApi]);

  const _setCurrentParticipantProjectSpecies = useCallback(
    (projectSpeciesId: string | number) => {
      if (participantProjectSpeciesApi?.data) {
        setCurrentParticipantProjectSpecies(
          participantProjectSpeciesApi?.data.find((projectSpecies) => projectSpecies.id === Number(projectSpeciesId))
        );
      }
    },
    [participantProjectSpeciesApi]
  );

  const _setCurrentDeliverable = (deliverable: Deliverable) => {
    setCurrentDeliverable(deliverable);
  };

  const [participantProjectSpeciesData, setParticipantProjectSpeciesData] = useState<ParticipantProjectSpeciesData>({
    participantProjectSpecies: [],
    currentDeliverable,
    setCurrentDeliverable: _setCurrentDeliverable,
    setCurrentParticipantProjectSpecies: _setCurrentParticipantProjectSpecies,
    reload,
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
    if (participantProjectSpeciesApi?.data && participantProjectSpeciesApi?.data.length > 0) {
      setParticipantProjectSpeciesData(
        (previousRecord: ParticipantProjectSpeciesData): ParticipantProjectSpeciesData => {
          return {
            ...previousRecord,
            setCurrentParticipantProjectSpecies: _setCurrentParticipantProjectSpecies,
            participantProjectSpecies: participantProjectSpeciesApi?.data || [],
            currentParticipantProjectSpecies,
          };
        }
      );
    }
  }, [participantProjectSpeciesApi?.data, setCurrentParticipantProjectSpecies, currentParticipantProjectSpecies]);

  return (
    <ParticipantProjectSpeciesContext.Provider value={participantProjectSpeciesData}>
      {children}
    </ParticipantProjectSpeciesContext.Provider>
  );
};

export default ParticipantProjectSpeciesProvider;
