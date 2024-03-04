import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers';
import MyAccountView from 'src/scenes/MyAccountRouter/MyAccountView';

const MyAccountRouter = () => {
  const { organizations, reloadOrganizations } = useOrganization();

  return (
    <Switch>
      <Route exact path={APP_PATHS.MY_ACCOUNT_EDIT}>
        <MyAccountView organizations={organizations} edit={true} reloadData={reloadOrganizations} />
      </Route>
      <Route exact path={APP_PATHS.MY_ACCOUNT}>
        <MyAccountView organizations={organizations} edit={false} />
      </Route>
    </Switch>
  );
};

export default MyAccountRouter;
