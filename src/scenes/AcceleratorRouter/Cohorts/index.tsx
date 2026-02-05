import React from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { APP_PATHS } from 'src/constants';

import CohortEditView from './CohortEditView';
import CohortNewView from './CohortNewView';
import CohortView from './CohortView';

const CohortsRouter = () => {
  return (
    <Routes>
      <Route path={':cohortId/edit'} element={<CohortEditView />} />
      <Route path={'new'} element={<CohortNewView />} />
      <Route path={':cohortId'} element={<CohortView />} />
      <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_COHORTS} />} />
    </Routes>
  );
};

export default CohortsRouter;
