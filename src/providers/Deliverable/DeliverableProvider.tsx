import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';
import { DeliverableWithOverdue } from 'src/types/Deliverables';

import { DeliverableContext, DeliverableData } from './DeliverableContext';

export type Props = {
  children: React.ReactNode;
};

const DeliverableProvider = ({ children }: Props) => {
  const params = useParams<{
    deliverableId: string;
    projectId: string;
  }>();
  const deliverableId = Number(params.deliverableId);
  const projectId = Number(params.projectId);

  const { deliverable } = useFetchDeliverable({ deliverableId, projectId });

  const [currentDeliverable, setCurrentDeliverable] = useState<DeliverableWithOverdue>();

  const [deliverableData, setDeliverableData] = useState<DeliverableData>({ deliverableId, projectId });

  useEffect(() => {
    if (deliverable) {
      setCurrentDeliverable(deliverable);
    }
  }, [deliverable]);

  useEffect(() => {
    setDeliverableData({
      currentDeliverable,
      deliverableId,
      projectId,
    });
  }, [currentDeliverable, deliverableId]);

  return <DeliverableContext.Provider value={deliverableData}>{children}</DeliverableContext.Provider>;
};

export default DeliverableProvider;
