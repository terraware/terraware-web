import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import DeliverableView from 'src/components/DeliverableView';

const DeliverablesView = () => {
  const { deliverableId } = useParams<{ deliverableId: string }>();

  // TODO fetch deliverable etc
  const deliverable = useMemo(() => ({ id: deliverableId }), [deliverableId]);

  return <DeliverableView deliverable={deliverable} />;
};

export default DeliverablesView;
