import React from 'react';
import { Route, Routes } from 'react-router';

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
          <Routes>
            <Route path={''} element={<SingleView />} />
            <Route path={'edit'} element={<EditView />} />
            <Route path={'invite'} element={<FunderInviteView />} />
          </Routes>
        }
      />
      <Route path={''} element={<FundingEntitiesListView />} />
    </Routes>
  );
};

export default FundingEntitiesRouter;
