import { Redirect, Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import DeliverableViewWrapper from './DeliverableViewWrapper';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = () => {
  return (
    <Switch>
      <Route exact path={APP_PATHS.ACCELERATOR_DELIVERABLE_VIEW}>
        <DeliverableViewWrapper />
      </Route>
      <Route exact path={APP_PATHS.ACCELERATOR_DELIVERABLES}>
        <DeliverablesList />
      </Route>
      <Route path={'*'}>
        <Redirect to={APP_PATHS.ACCELERATOR_DELIVERABLES} />
      </Route>
    </Switch>
  );
};

export default DeliverablesRouter;
