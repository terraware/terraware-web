import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import PlantsDashboardView from 'src/scenes/PlantsDashboardRouter/PlantsDashboardView';

const PlantsDashboardRouter = () => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.PLANTS_DASHBOARD}>
        <PlantsDashboardView />
      </Route>
      <Route exact path={APP_PATHS.PLANTING_SITE_DASHBOARD}>
        <PlantsDashboardView />
      </Route>
    </Switch>
  );
};

export default PlantsDashboardRouter;
