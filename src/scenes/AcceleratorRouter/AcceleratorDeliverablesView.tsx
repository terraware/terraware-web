import { useParams } from 'react-router-dom';
import Page from 'src/components/Page';
import DeliverableView from 'src/components/DeliverableView';
import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';

const AcceleratorDeliverablesView = () => {
  const { deliverableId } = useParams<{ deliverableId: string }>();

  const { deliverable } = useFetchDeliverable({
    deliverableId: Number(deliverableId),
    isAcceleratorConsole: true,
  });

  if (deliverable) {
    return (
      <DeliverableView
        callToAction={deliverable.status !== 'Approved' ? 'Buttons coming soon!' : undefined}
        deliverable={deliverable}
        isAcceleratorConsole={true}
      />
    );
  } else {
    return <Page isLoading={true} />;
  }
};

export default AcceleratorDeliverablesView;
