import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import CohortEditView from './CohortEditView';
import CohortListView from './CohortListView';
import CohortNewView from './CohortNewView';
import CohortView from './CohortView';

const CohortsRouter = () => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.ACCELERATOR_COHORTS_EDIT}>
        <CohortEditView />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_COHORTS_NEW}>
        <CohortNewView />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_COHORTS_VIEW}>
        <CohortView />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_COHORTS}>
        <CohortListView />
      </Route>
      <Route path={'*'}>
        <Redirect to={APP_PATHS.ACCELERATOR_COHORTS} />
      </Route>
    </Switch>
  );
};

export default CohortsRouter;
