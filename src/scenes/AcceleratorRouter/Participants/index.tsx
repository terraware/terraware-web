import React, { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import ParticipantsEdit from './ParticipantsEdit';
import ParticipantsNew from './ParticipantsNew';
import ParticipantsView from './ParticipantsView';

const ParticipantsRouter = () => {
  return (
    <Routes>
      <Route path={'new'} element={<ParticipantsNew />} />
      <Route path={':participantId/edit'} element={<ParticipantsEdit />} />
      <Route path={':participantId'} element={<ParticipantsView />} />
      <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW} />} />
    </Routes>
  );
};

export default ParticipantsRouter;
