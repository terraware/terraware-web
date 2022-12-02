import { useParams } from 'react-router-dom';
import { ServerOrganization } from 'src/types/Organization';
import TfMain from '../common/TfMain';

type NurseryReassignmentProps = {
  organization: ServerOrganization;
};

export default function NurseryReassignment(props: NurseryReassignmentProps): JSX.Element {
  const { deliveryId } = useParams<{ deliveryId: string }>();

  return <TfMain>Nursery Reassignment {deliveryId} </TfMain>;
}
