import React, { useCallback, useEffect, useState } from 'react';

import {
  requestGetParticipantProjectSpecies,
  requestListParticipantProjectSpecies,
} from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import {
  selectParticipantProjectSpeciesGetRequest,
  selectParticipantProjectSpeciesListRequest,
} from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { ParticipantProjectSpecies } from 'src/services/ParticipantProjectSpeciesService';

import { useProjectData } from '../Project/ProjectContext';
import { ParticipantProjectSpeciesContext, ParticipantProjectSpeciesData } from './ParticipantProjectSpeciesContext';

export type Props = {
  children: React.ReactNode;
};

const ParticipantProjectSpeciesProvider = ({ children }: Props) => {
  const dispatch = useAppDispatch();

  const { projectId } = useProjectData();

  const [currentParticipantProjectSpecies, setCurrentParticipantProjectSpecies] = useState<ParticipantProjectSpecies>();
  const participantProjectSpeciesApi = useAppSelector(selectParticipantProjectSpeciesListRequest(projectId));
  const [requestId, setRequestId] = useState('');
  const updatedProjectResponse = useAppSelector(selectParticipantProjectSpeciesGetRequest(requestId));

  useEffect(() => {
    if (updatedProjectResponse?.status === 'success') {
      setCurrentParticipantProjectSpecies(updatedProjectResponse.data);
    }
  }, [updatedProjectResponse]);

  const reload = useCallback(
    (participantProjectSpeciesId: number) => {
      const request = dispatch(requestGetParticipantProjectSpecies(participantProjectSpeciesId));
      setRequestId(request.requestId);
    },
    [dispatch, projectId]
  );

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

  const [participantProjectSpeciesData, setParticipantProjectSpeciesData] = useState<ParticipantProjectSpeciesData>({
    participantProjectSpecies: [],
    setCurrentParticipantProjectSpecies: _setCurrentParticipantProjectSpecies,
    reload,
  });
  useEffect(() => {
    if (projectId) {
      dispatch(requestListParticipantProjectSpecies(projectId));
    }
  }, [projectId]);

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
