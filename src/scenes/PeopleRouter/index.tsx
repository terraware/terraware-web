import React from 'react';
import { Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';
import NewPersonView from 'src/scenes/PeopleRouter/NewPersonView';
import PeopleListView from 'src/scenes/PeopleRouter/PeopleListView';
import PersonDetailsView from 'src/scenes/PeopleRouter/PersonDetailsView';

const PeopleRouter = () => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.PEOPLE_NEW}>
        <NewPersonView />
      </Route>
      <Route exact path={APP_PATHS.PEOPLE_EDIT}>
        <NewPersonView />
      </Route>
      <Route path={APP_PATHS.PEOPLE_VIEW}>
        <PersonDetailsView />
      </Route>
      <Route exact path={APP_PATHS.PEOPLE}>
        <PeopleListView />
      </Route>
    </Switch>
  );
};

export default PeopleRouter;
