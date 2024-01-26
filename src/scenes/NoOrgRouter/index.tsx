import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import { useUser } from 'src/providers';
import useEnvironment from 'src/utils/useEnvironment';
import NoOrgLandingPage from 'src/components/emptyStatePages/NoOrgLandingPage';
import MyAccountRouter from 'src/scenes/MyAccountRouter';
import OptInFeaturesView from 'src/scenes/OptInFeatures';

const NoOrgRouter = () => {
  const { isProduction } = useEnvironment();
  const { reloadUserPreferences: reloadPreferences } = useUser();

  return (
    <Switch>
      <Route path={APP_PATHS.MY_ACCOUNT}>
        <MyAccountRouter />
      </Route>

      <Route exact path={APP_PATHS.WELCOME}>
        <NoOrgLandingPage />
      </Route>
      {!isProduction && (
        <Route exact path={APP_PATHS.OPT_IN}>
          <OptInFeaturesView refresh={reloadPreferences} />
        </Route>
      )}
      <Route path='*'>
        <Redirect to={APP_PATHS.WELCOME} />
      </Route>
    </Switch>
  );
};

export default NoOrgRouter;
