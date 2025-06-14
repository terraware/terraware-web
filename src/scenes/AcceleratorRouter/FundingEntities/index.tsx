import React from 'react';
import { Route, Routes } from 'react-router';

import FundingEntityProvider from 'src/providers/FundingEntityProvider';
import FunderInviteView from 'src/scenes/FunderInvite/FunderInviteView';

import EditView from './EditView';
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
              <Route path={'invite'} element={<FunderInviteView />} />
            </Routes>
          </FundingEntityProvider>
        }
      />
      <Route path={''} element={<FundingEntitiesListView />} />
    </Routes>
  );
};

export default FundingEntitiesRouter;
