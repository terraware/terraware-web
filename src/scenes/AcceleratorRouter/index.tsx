import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import AcceleratorAdminView from './AcceleratorAdminView';

const AcceleratorRouter = () => {
  return (
    <Switch>
      <Route path={APP_PATHS.ACCELERATOR_ADMIN}>
        <AcceleratorAdminView />
      </Route>
    </Switch>
  );
};

export default AcceleratorRouter;
