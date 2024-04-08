import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import EditView from './EditView';
import ScoresView from './ScoresView';
import ScoringProvider from './ScoringProvider';

const ScoringRouter = () => {
  return (
    <ScoringProvider>
      <Switch>
        <Route exact path={APP_PATHS.ACCELERATOR_SCORING}>
          <ScoresView />
        </Route>
        <Route exact path={APP_PATHS.ACCELERATOR_SCORING_EDIT}>
          <EditView />
        </Route>
        <Route path={'*'}>
          <Redirect to={APP_PATHS.ACCELERATOR_SCORING} />
        </Route>
      </Switch>
    </ScoringProvider>
  );
};

export default ScoringRouter;
