import { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import CohortEditView from './CohortEditView';
import CohortNewView from './CohortNewView';
import CohortView from './CohortView';
import CohortsListView from './CohortsListView';

const CohortsRouter = () => {
  return (
    <Routes>
      <Route path={APP_PATHS.ACCELERATOR_COHORTS_EDIT} element={<CohortEditView />} />
      <Route path={APP_PATHS.ACCELERATOR_COHORTS_NEW} element={<CohortNewView />} />
      <Route path={APP_PATHS.ACCELERATOR_COHORTS_VIEW} element={<CohortView />} />
      <Route path={APP_PATHS.ACCELERATOR_COHORTS} element={<CohortsListView />} />
      <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_COHORTS} />} />
    </Routes>
  );
};

export default CohortsRouter;
