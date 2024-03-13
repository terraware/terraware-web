import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import ScorecardEditView from './ScorecardEditView';
import ScorecardView from './ScorecardView';

const ScoringRouter = () => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.ACCELERATOR_SCORING}>
        <ScorecardView />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_SCORING_EDIT}>
        <ScorecardEditView />
      </Route>
      <Route path={'*'}>
        <Redirect to={APP_PATHS.ACCELERATOR_SCORING} />
      </Route>
    </Switch>
  );
};

export default ScoringRouter;
