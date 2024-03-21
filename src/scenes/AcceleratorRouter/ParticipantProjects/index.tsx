import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import ParticipantProjectProvider from './ParticipantProjectProvider';
import SingleView from './SingleView';

const ParticipantProjectsRouter = () => {
  return (
    <ParticipantProjectProvider>
      <Switch>
        <Route exact path={APP_PATHS.ACCELERATOR_PROJECT_VIEW}>
          <SingleView />
        </Route>
        <Route path={'*'}>
          <Redirect to={APP_PATHS.ACCELERATOR_OVERVIEW} />
        </Route>
      </Switch>
    </ParticipantProjectProvider>
  );
};

export default ParticipantProjectsRouter;
