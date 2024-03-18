import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import ListView from './ListView';
import PersonEdit from './PersonEdit';
import PersonView from './PersonView';

const PeopleRouter = () => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.ACCELERATOR_PEOPLE}>
        <ListView />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_PERSON}>
        <PersonView />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_PERSON_EDIT}>
        <PersonEdit />
      </Route>
      <Route path={'*'}>
        <Redirect to={APP_PATHS.ACCELERATOR_PEOPLE} />
      </Route>
    </Switch>
  );
};

export default PeopleRouter;
