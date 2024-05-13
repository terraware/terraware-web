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
  const newParticipantProjectSpecies = useAppSelector(selectParticipantProjectSpeciesGetRequest(requestId));

  const reload = useCallback(() => {
    if (currentParticipantProjectSpecies) {
      const request = dispatch(requestGetParticipantProjectSpecies(currentParticipantProjectSpecies?.id));
      setRequestId(request.requestId);
    }
  }, [dispatch, projectId]);

  useEffect(() => {
    if (currentParticipantProjectSpecies) {
      _setCurrentParticipantProjectSpecies(currentParticipantProjectSpecies?.id);
    }
  }, [participantProjectSpeciesApi]);

  const _setCurrentParticipantProjectSpecies = useCallback(
    (projectSpeciesId: string | number) => {
      const request = dispatch(requestGetParticipantProjectSpecies(Number(projectSpeciesId)));
      setRequestId(request.requestId);
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

  useEffect(() => {
    if (newParticipantProjectSpecies) {
      setParticipantProjectSpeciesData(
        (previousRecord: ParticipantProjectSpeciesData): ParticipantProjectSpeciesData => {
          return {
            ...previousRecord,
            currentParticipantProjectSpecies: newParticipantProjectSpecies.data,
          };
        }
      );
    }
  }, [newParticipantProjectSpecies]);

  return (
    <ParticipantProjectSpeciesContext.Provider value={participantProjectSpeciesData}>
      {children}
    </ParticipantProjectSpeciesContext.Provider>
  );
};

export default ParticipantProjectSpeciesProvider;
