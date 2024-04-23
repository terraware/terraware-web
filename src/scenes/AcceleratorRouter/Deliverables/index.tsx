import React, { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import DeliverableViewWrapper from './DeliverableViewWrapper';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = () => {
  return (
    <Routes>
      <Route path={'/:deliverableId/submissions/:projectId'} element={<DeliverableViewWrapper />} />
      <Route path={''} element={<DeliverablesList />} />
      <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_DELIVERABLES} />} />
    </Routes>
  );
};

export default DeliverablesRouter;
