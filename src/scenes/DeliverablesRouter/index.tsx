import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import DeliverablesEdit from './DeliverablesEdit';
import DeliverablesView from './DeliverablesView';
import DeliverablesList from './DeliverablesList';

const DeliverablesRouter = ({ reloadTracking }: PlantingSitesProps): JSX.Element => {
  const userDrawnDetailedSites = isEnabled('User Detailed Sites');

  return (
    <Switch>
      <Route path={APP_PATHS.DELIVERABLES_EDIT}>
        <DeliverablesEdit />
      </Route>
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
