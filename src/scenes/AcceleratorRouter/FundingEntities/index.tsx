import React, { Route, Routes } from 'react-router-dom';

import FundingEntityProvider from 'src/providers/FundingEntityProvider';

import EditView from './EditView';
import FundingEntitiesListView from './ListView';
import SingleView from './SingleView';

const FundingEntitiesRouter = () => {
  return (
    <Routes>
      <Route
        path={':fundingEntityId/*'}
        element={
          <FundingEntityProvider>
            <Routes>
              <Route path={''} element={<SingleView />} />
              <Route path={'edit'} element={<EditView />} />
            </Routes>
          </FundingEntityProvider>
        }
      />
      <Route path={''} element={<FundingEntitiesListView />} />
    </Routes>
  );
};

export default FundingEntitiesRouter;
