import { useParams } from 'react-router-dom';
import { ServerOrganization } from 'src/types/Organization';
import TfMain from '../common/TfMain';

type NurseryWithdrawalsDetailsProps = {
  organization: ServerOrganization;
};

export default function NurseryWithdrawalsDetails(props: NurseryWithdrawalsDetailsProps): JSX.Element {
  const { withdrawalId } = useParams<{ withdrawalId: string }>();

  return <TfMain>Nursery Withdrawal Details {withdrawalId} </TfMain>;
}
