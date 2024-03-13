import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import VotingView from './Voting';
import VotingEdit from './VotingEdit';

const VotingRouter = () => {
  return (
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
  );
};

export default VotingRouter;
