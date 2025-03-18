import React, { Route, Routes } from 'react-router-dom';

import FundingEntitiesListView from './ListView';
import SingleView from './SingleView';

const FundingEntitiesRouter = () => {
  return (
    <Routes>
      <Route
        path={':fundingEntityId/*'}
        element={
          <Routes>
            <Route path={''} element={<SingleView />} />
          </Routes>
        }
      />
      <Route path={''} element={<FundingEntitiesListView />} />
    </Routes>
  );
};

export default FundingEntitiesRouter;
