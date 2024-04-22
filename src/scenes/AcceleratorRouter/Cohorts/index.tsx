import React, { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import CohortEditView from './CohortEditView';
import CohortNewView from './CohortNewView';
import CohortView from './CohortView';
import CohortsListView from './CohortsListView';

const CohortsRouter = () => {
  return (
    <Routes>
      <Route path={':cohortId/edit'} element={<CohortEditView />} />
      <Route path={'new'} element={<CohortNewView />} />
      <Route path={':cohortId'} element={<CohortView />} />
      <Route path={''} element={<CohortsListView />} />
      <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_COHORTS} />} />
    </Routes>
  );
};

export default CohortsRouter;
