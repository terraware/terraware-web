import { ServerOrganization } from 'src/types/Organization';
import TfMain from '../common/TfMain';

type NurseryWithdrawalsProps = {
  organization: ServerOrganization;
};

export default function NurseryWithdrawals(props: NurseryWithdrawalsProps): JSX.Element {
  return <TfMain>Nursery Withdrawals</TfMain>;
}
