import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';
import { Deliverable } from 'src/types/Deliverables';

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

  const [currentDeliverable, setCurrentDeliverable] = useState<Deliverable>();

  const [deliverableData, setDeliverableData] = useState<DeliverableData>({ deliverableId });

  useEffect(() => {
    if (deliverable) {
      setCurrentDeliverable(deliverable);
    }
  }, [deliverable]);

  useEffect(() => {
    setDeliverableData({
      currentDeliverable,
      deliverableId,
    });
  }, [currentDeliverable, deliverableId]);

  return <DeliverableContext.Provider value={deliverableData}>{children}</DeliverableContext.Provider>;
};

export default DeliverableProvider;
