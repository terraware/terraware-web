import { Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import DeliverableViewWrapper from './DeliverableViewWrapper';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path={APP_PATHS.DELIVERABLE_VIEW} element={<DeliverableViewWrapper />} />
      <Route path={'*'} element={<DeliverablesList />} />
    </Routes>
  );
};

export default DeliverablesRouter;
