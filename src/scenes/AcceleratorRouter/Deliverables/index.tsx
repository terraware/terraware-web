import { Navigate, Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import DeliverableViewWrapper from './DeliverableViewWrapper';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = () => {
  return (
    <Routes>
      <Route path={APP_PATHS.ACCELERATOR_DELIVERABLE_VIEW} element={<DeliverableViewWrapper />} />
      <Route path={APP_PATHS.ACCELERATOR_DELIVERABLES} element={<DeliverablesList />} />
      <Route path={'*'} element={<Navigate to={APP_PATHS.ACCELERATOR_DELIVERABLES} />} />
    </Routes>
  );
};

export default DeliverablesRouter;
