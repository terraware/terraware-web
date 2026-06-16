import React from 'react';
import { Route, Routes } from 'react-router';

import OrganizationView from 'src/scenes/OrganizationRouter/OrganizationView';

const OrganizationRouter = () => {
  return (
    <Routes>
      <Route path={'/*'} element={<OrganizationView />} />
    </Routes>
  );
};

export default OrganizationRouter;
