import { useParams } from 'react-router-dom';

import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';
import Page from 'src/components/Page';

import DeliverableView from './DeliverableView';

const DeliverableViewWrapper = () => {
  const { deliverableId, projectId } = useParams<{ deliverableId: string; projectId: string }>();

  const { deliverable } = useFetchDeliverable({ deliverableId: Number(deliverableId), projectId: Number(projectId) });

  if (deliverable) {
    return <DeliverableView deliverable={deliverable} />;
  } else {
    return <Page isLoading={true} />;
  }
};

export default DeliverableViewWrapper;
