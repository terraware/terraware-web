import isEnabled from 'src/features';
import NurseryReassignment from './NurseryReassignment';
import NurseryWithdrawalsBase from './NurseryWithdrawals';
import NurseryPlantingsAndWithdrawals from './NurseryPlantingsAndWithdrawals';
import NurseryWithdrawalsDetails from './NurseryWithdrawalsDetails';

/**
 * Primary route management for nursery withdrawals.
 */
type NurseryWithdrawalsProps = {
  reloadTracking: () => void;
};
export default function NurseryWithdrawals({ reloadTracking }: NurseryWithdrawalsProps): JSX.Element {
  const trackingV2 = isEnabled('TrackingV2');

  if (trackingV2) {
    return <NurseryPlantingsAndWithdrawals reloadTracking={reloadTracking} />;
  }

  return <NurseryWithdrawalsBase />;
}

export { NurseryReassignment, NurseryWithdrawals, NurseryWithdrawalsDetails };
