import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import isEnabled from 'src/features';

const RedirectsRouter = () => {
  const featureFlagProjects = isEnabled('Projects');

  return (
    <Switch>
      {/* Redirects. Invalid paths will redirect to the closest valid path. */}
      {/* In alphabetical order for easy reference with APP_PATHS, except for /home which must go last */}
      <Route path={APP_PATHS.ACCESSIONS + '/'}>
        <Redirect to={APP_PATHS.ACCESSIONS} />
      </Route>
      <Route path={APP_PATHS.CHECKIN + '/'}>
        <Redirect to={APP_PATHS.CHECKIN} />
      </Route>
      <Route path={APP_PATHS.CONTACT_US + '/'}>
        <Redirect to={APP_PATHS.CONTACT_US} />
      </Route>
      <Route exact path={APP_PATHS.ORGANIZATION + '/'}>
        <Redirect to={APP_PATHS.ORGANIZATION} />
      </Route>
      <Route exact path={APP_PATHS.PEOPLE + '/'}>
        <Redirect to={APP_PATHS.PEOPLE} />
      </Route>
      {featureFlagProjects && (
        <Route exact path={APP_PATHS.PROJECTS + '/'}>
          <Redirect to={APP_PATHS.PROJECTS} />
        </Route>
      )}
      <Route path={APP_PATHS.SEEDS_DASHBOARD + '/'}>
        <Redirect to={APP_PATHS.SEEDS_DASHBOARD} />
      </Route>
      <Route path={APP_PATHS.SPECIES + '/'}>
        <Redirect to={APP_PATHS.SPECIES} />
      </Route>
      <Route path='*'>
        <Redirect to={APP_PATHS.HOME} />
      </Route>
    </Switch>
  );
};

export default RedirectsRouter;
