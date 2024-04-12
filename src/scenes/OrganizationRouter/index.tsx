import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { useOrganization } from 'src/providers';
import EditOrganizationView from 'src/scenes/OrganizationRouter/EditOrganizationView';
import OrganizationView from 'src/scenes/OrganizationRouter/OrganizationView';

const OrganizationRouter = () => {
  const { selectedOrganization, reloadOrganizations } = useOrganization();

  return (
    <Routes>
      <Route
        path={'/edit'}
        element={
          <EditOrganizationView organization={selectedOrganization} reloadOrganizationData={reloadOrganizations} />
        }
      />
      <Route path={'/*'} element={<OrganizationView />} />
    </Routes>
  );
};

export default OrganizationRouter;
