import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import ListView from './ListView';

const PeopleRouter = () => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.ACCELERATOR_PEOPLE}>
        <ListView />
      </Route>
      <Route path={'*'}>
        <Redirect to={APP_PATHS.ACCELERATOR_PEOPLE} />
      </Route>
    </Switch>
  );
};

export default PeopleRouter;
