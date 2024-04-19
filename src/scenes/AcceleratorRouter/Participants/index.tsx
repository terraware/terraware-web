import React, { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import ParticipantsEdit from './ParticipantsEdit';
import ParticipantsNew from './ParticipantsNew';
import ParticipantsView from './ParticipantsView';

const ParticipantsRouter = () => {
  return (
    <Routes>
      <Route path={APP_PATHS.ACCELERATOR_PARTICIPANTS_NEW} element={<ParticipantsNew />} />
      <Route path={APP_PATHS.ACCELERATOR_PARTICIPANTS_EDIT} element={<ParticipantsEdit />} />
      <Route path={APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW} element={<ParticipantsView />} />
      <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW} />} />
    </Routes>
  );
};

export default ParticipantsRouter;
