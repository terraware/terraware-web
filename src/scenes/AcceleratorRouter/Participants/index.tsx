import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import ParticipantsEdit from './ParticipantsEdit';
import ParticipantsNew from './ParticipantsNew';
import ParticipantsView from './ParticipantsView';

const ParticipantsRouter = () => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.ACCELERATOR_PARTICIPANTS_NEW}>
        <ParticipantsNew />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_PARTICIPANTS_EDIT}>
        <ParticipantsEdit />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW}>
        <ParticipantsView />
      </Route>
      <Route path={'*'}>
        <Redirect to={APP_PATHS.ACCELERATOR_PARTICIPANTS_VIEW} />
      </Route>
    </Switch>
  );
};

export default ParticipantsRouter;
