import React from 'react';
import { Route, Routes } from 'react-router';

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
          selectedOrganization ? (
            <EditOrganizationView organization={selectedOrganization} reloadOrganizationData={reloadOrganizations} />
          ) : (
            <div>No organization selected</div>
          )
        }
      />
      <Route path={'/*'} element={<OrganizationView />} />
    </Routes>
  );
};

export default OrganizationRouter;
