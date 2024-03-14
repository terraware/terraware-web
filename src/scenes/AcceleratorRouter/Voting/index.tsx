import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import VotingEdit from './VotingEdit';
import VotingProvider from './VotingProvider';
import VotingView from './VotingView';

const VotingRouter = () => {
  return (
    <VotingProvider>
      <Switch>
        <Route exact path={APP_PATHS.ACCELERATOR_VOTING}>
          <VotingView />
        </Route>
        <Route exact path={APP_PATHS.ACCELERATOR_VOTING_EDIT}>
          <VotingEdit />
        </Route>
        <Route path={'*'}>
          <Redirect to={APP_PATHS.ACCELERATOR_VOTING} />
        </Route>
      </Switch>
    </VotingProvider>
  );
};

export default VotingRouter;
