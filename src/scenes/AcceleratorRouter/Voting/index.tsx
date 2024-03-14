import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import VotingEdit from './VotingEdit';
import VotingProvider from './VotingProvider';
import VotingView from './VotingView';

const VotingRouter = () => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.ACCELERATOR_VOTING}>
        <VotingProvider>
          <VotingView />
        </VotingProvider>
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_VOTING_EDIT}>
        <VotingProvider>
          <VotingEdit />
        </VotingProvider>
      </Route>
      <Route path={'*'}>
        <Redirect to={APP_PATHS.ACCELERATOR_VOTING} />
      </Route>
    </Switch>
  );
};

export default VotingRouter;
