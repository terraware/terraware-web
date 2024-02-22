import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DeliverableView from 'src/components/DeliverableView';

const AcceleratorDeliverablesView = () => {
  const { deliverableId } = useParams<{ deliverableId: string }>();

  // TODO fetch deliverable etc
  const deliverable = useMemo(() => ({ id: deliverableId }), [deliverableId]);

  return <DeliverableView deliverable={deliverable} isAcceleratorConsole={true} />;
};

export default AcceleratorDeliverablesView;
