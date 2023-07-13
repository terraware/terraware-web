import isEnabled from 'src/features';
import NurseryReassignment from './NurseryReassignment';
import NurseryWithdrawalsV1 from './NurseryWithdrawalsV1';
import NurseryWithdrawalsV2 from './NurseryWithdrawals';
import NurseryWithdrawalsDetails from './NurseryWithdrawalsDetails';

/**
 * Primary route management for nursery withdrawals.
 */
export default function NurseryWithdrawals(): JSX.Element {
  const trackingV2 = isEnabled('TrackingV2');

  if (trackingV2) {
    return <NurseryWithdrawalsV2 />;
  }

  return <NurseryWithdrawalsV1 />;
}

export { NurseryReassignment, NurseryWithdrawals, NurseryWithdrawalsDetails };
