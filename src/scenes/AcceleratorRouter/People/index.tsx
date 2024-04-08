import React, { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import EditView from './EditView';
import ListView from './ListView';
import NewView from './NewView';
import PersonProvider from './PersonProvider';
import SingleView from './SingleView';

const PeopleRouter = () => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.ACCELERATOR_PEOPLE}>
        <ListView />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_PERSON_NEW}>
        <NewView />
      </Route>
      <Route path={APP_PATHS.ACCELERATOR_PERSON}>
        <PersonProvider>
          <Switch>
            <Route exact path={APP_PATHS.ACCELERATOR_PERSON}>
              <SingleView />
            </Route>
            <Route exact path={APP_PATHS.ACCELERATOR_PERSON_EDIT}>
              <EditView />
            </Route>
          </Switch>
        </PersonProvider>
      </Route>
      <Route path={'*'}>
        <Redirect to={APP_PATHS.ACCELERATOR_PEOPLE} />
      </Route>
    </Switch>
  );
};

export default PeopleRouter;
