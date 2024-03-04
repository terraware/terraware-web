import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import EditOrganizationView from 'src/scenes/OrganizationRouter/EditOrganizationView';
import OrganizationView from 'src/scenes/OrganizationRouter/OrganizationView';

const OrganizationRouter = () => {
  const { selectedOrganization, reloadOrganizations } = useOrganization();

  return (
    <Switch>
      <Route exact path={APP_PATHS.ORGANIZATION_EDIT}>
        <EditOrganizationView organization={selectedOrganization} reloadOrganizationData={reloadOrganizations} />
      </Route>

      <Route exact path={APP_PATHS.ORGANIZATION}>
        <OrganizationView />
      </Route>
    </Switch>
  );
};

export default OrganizationRouter;
