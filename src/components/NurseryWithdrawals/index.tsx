import { Route, Switch } from 'react-router-dom';
import { APP_PATHS } from 'src/constants';
import { Species } from 'src/types/Species';
import isEnabled from 'src/features';
import NurseryReassignment from './NurseryReassignment';
import NurseryWithdrawalsBase from './NurseryWithdrawals';
import NurseryWithdrawalsDetails from './NurseryWithdrawalsDetails';
import NurserySiteWithdrawals from './NurserySiteWithdrawals';

/**
 * Primary route management for nursery withdrawals.
 */
type NurseryWithdrawalsProps = {
  reloadTracking: () => void;
  species: Species[];
  plantingSubzoneNames: Record<number, string>;
};

function NurseryWithdrawals({ reloadTracking, species, plantingSubzoneNames }: NurseryWithdrawalsProps): JSX.Element {
  const trackingV2 = isEnabled('TrackingV2');

  return (
    <Switch>
      <Route exact path={APP_PATHS.NURSERY_WITHDRAWALS_DETAILS}>
        <NurseryWithdrawalsDetails species={species} plantingSubzoneNames={plantingSubzoneNames} />
      </Route>
      {trackingV2 && (
        <Route path={APP_PATHS.NURSERY_SITE_WITHDRAWALS}>
          <NurserySiteWithdrawals reloadTracking={reloadTracking} />
        </Route>
      )}
      {trackingV2 && (
        <Route path={'*'}>
          <NurserySiteWithdrawals reloadTracking={reloadTracking} />
        </Route>
      )}
      {!trackingV2 && (
        <Route path={'*'}>
          <NurseryWithdrawalsBase />
        </Route>
      )}
    </Switch>
  );
}

export { NurseryReassignment, NurseryWithdrawals };
