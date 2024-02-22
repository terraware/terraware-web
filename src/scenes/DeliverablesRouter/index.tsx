import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import DeliverablesView from './DeliverablesView';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = (): JSX.Element => {
  return (
    <Switch>
      <Route path={APP_PATHS.DELIVERABLES_VIEW}>
        <DeliverablesView />
      </Route>
      <Route path={'*'}>
        <DeliverablesList />
      </Route>
    </Switch>
  );
};

export default DeliverablesRouter;
