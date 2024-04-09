import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import EditOrganizationView from 'src/scenes/OrganizationRouter/EditOrganizationView';
import OrganizationView from 'src/scenes/OrganizationRouter/OrganizationView';

const OrganizationRouter = () => {
  const { selectedOrganization, reloadOrganizations } = useOrganization();

  return (
    <Routes>
      <Route
        path={APP_PATHS.ORGANIZATION_EDIT}
        element={
          <EditOrganizationView organization={selectedOrganization} reloadOrganizationData={reloadOrganizations} />
        }
      />
      <Route path={APP_PATHS.ORGANIZATION} element={<OrganizationView />} />
    </Routes>
  );
};

export default OrganizationRouter;
