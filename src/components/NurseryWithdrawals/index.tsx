import NurseryReassignment from './NurseryReassignment';
import NurseryPlantingsAndWithdrawals from './NurseryPlantingsAndWithdrawals';
import NurseryWithdrawalsDetails from './NurseryWithdrawalsDetails';

/**
 * Primary route management for nursery withdrawals.
 */
type NurseryWithdrawalsProps = {
  reloadTracking: () => void;
};
export default function NurseryWithdrawals({ reloadTracking }: NurseryWithdrawalsProps): JSX.Element {
  return <NurseryPlantingsAndWithdrawals reloadTracking={reloadTracking} />;
}

export { NurseryReassignment, NurseryWithdrawals, NurseryWithdrawalsDetails };
