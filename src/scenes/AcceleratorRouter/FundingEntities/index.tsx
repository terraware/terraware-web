import React, { Route, Routes } from 'react-router-dom';

import FundingEntityProvider from 'src/providers/FundingEntityProvider';

import EditView from './EditView';
import InviteView from './InviteView';
import FundingEntitiesListView from './ListView';
import NewView from './NewView';
import SingleView from './SingleView';

const FundingEntitiesRouter = () => {
  return (
    <Routes>
      <Route path={'new'} element={<NewView />} />
      <Route
        path={':fundingEntityId/*'}
        element={
          <FundingEntityProvider>
            <Routes>
              <Route path={''} element={<SingleView />} />
              <Route path={'edit'} element={<EditView />} />
              <Route path={'invite'} element={<InviteView />} />
            </Routes>
          </FundingEntityProvider>
        }
      />
      <Route path={''} element={<FundingEntitiesListView />} />
    </Routes>
  );
};

export default FundingEntitiesRouter;
