import { useEffect } from 'react';
import React, { Navigate, Route, Routes, useParams } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';

import EditView from './EditView';
import ParticipantProjectProvider from './ParticipantProjectProvider';
import Scoring from './Scoring';
import ScoringProvider from './Scoring/ScoringProvider';
import SingleView from './SingleView';
import Voting from './Voting';
import VotingProvider from './Voting/VotingProvider';

const ParticipantProjectRouter = () => {
  const pathParams = useParams<{ projectId: string }>();
  const { setCurrentParticipantProject } = useParticipantData();

  useEffect(() => setCurrentParticipantProject(Number(pathParams.projectId)), [pathParams]);

  return (
    <VotingProvider>
      <ScoringProvider>
        <ParticipantProjectProvider>
          <Routes>
            <Route path={'edit'} element={<EditView />} />
            <Route path={''} element={<SingleView />} />
            <Route path={'scores/*'} element={<Scoring />} />
            <Route path={'votes/*'} element={<Voting />} />
            <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_OVERVIEW} />} />
          </Routes>
        </ParticipantProjectProvider>
      </ScoringProvider>
    </VotingProvider>
  );
};

export default ParticipantProjectRouter;
