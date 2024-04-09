import { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import EditView from './EditView';
import ScoresView from './ScoresView';
import ScoringProvider from './ScoringProvider';

const ScoringRouter = () => {
  return (
    <ScoringProvider>
      <Routes>
        <Route path={APP_PATHS.ACCELERATOR_SCORING} element={<ScoresView />} />
        <Route path={APP_PATHS.ACCELERATOR_SCORING_EDIT} element={<EditView />} />
        <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_SCORING} />} />
      </Routes>
    </ScoringProvider>
  );
};

export default ScoringRouter;
