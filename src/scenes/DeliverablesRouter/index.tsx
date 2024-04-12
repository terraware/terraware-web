import { Route, Routes } from 'react-router-dom';

import DeliverableViewWrapper from './DeliverableViewWrapper';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = (): JSX.Element => {
  return (
    <Routes>
      <Route path={'/:deliverableId/submissions/:projectId'} element={<DeliverableViewWrapper />} />
      <Route path={'*'} element={<DeliverablesList />} />
    </Routes>
  );
};

export default DeliverablesRouter;
