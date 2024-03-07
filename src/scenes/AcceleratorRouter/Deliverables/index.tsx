import { Route, Switch } from 'react-router-dom';

import { APP_PATHS } from 'src/constants';

import DeliverableViewWrapper from './DeliverableViewWrapper';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = () => {
  return (
    <Switch>
      <Route path={APP_PATHS.ACCELERATOR_DELIVERABLES_VIEW}>
        <DeliverableViewWrapper />
      </Route>
      <Route path={'*'}>
        <DeliverablesList />
      </Route>
    </Switch>
  );
};

export default DeliverablesRouter;
