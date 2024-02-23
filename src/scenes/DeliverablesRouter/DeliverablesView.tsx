import { useParams } from 'react-router-dom';
import Page from 'src/components/Page';
import DeliverableView from 'src/components/DeliverableView';
import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';

const DeliverablesView = () => {
  const { deliverableId } = useParams<{ deliverableId: string }>();

  const { deliverable } = useFetchDeliverable({ deliverableId: Number(deliverableId) });

  if (deliverable) {
    return <DeliverableView deliverable={deliverable} />;
  } else {
    return <Page isLoading={true} />;
  }
};

export default DeliverablesView;
