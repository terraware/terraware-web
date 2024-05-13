import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';
import { Deliverable } from 'src/types/Deliverables';

import { DeliverableContext, DeliverableData } from './DeliverableContext';

export type Props = {
  children: React.ReactNode;
};

const DeliverableProvider = ({ children }: Props) => {
  const [currentDeliverable, setCurrentDeliverable] = useState<Deliverable>();

  const { deliverableId: _deliverableId, projectId: _projectId } = useParams<{
    deliverableId: string;
    projectId: string;
  }>();

  const deliverableId = Number(_deliverableId);
  const projectId = Number(_projectId);

  const { deliverable } = useFetchDeliverable({ deliverableId: Number(deliverableId), projectId: Number(projectId) });

  const _setCurrentDeliverable = (deliverable: Deliverable) => {
    setCurrentDeliverable(deliverable);
  };

  const [deliverableData, setDeliverableData] = useState<DeliverableData>({
    currentDeliverable,
    setCurrentDeliverable: _setCurrentDeliverable,
  });

  useEffect(() => {
    if (deliverable) {
      _setCurrentDeliverable(deliverable);
    }
  }, [deliverable]);

  useEffect(() => {
    if (currentDeliverable) {
      setDeliverableData((previousRecord: DeliverableData): DeliverableData => {
        return {
          ...previousRecord,
          currentDeliverable,
        };
      });
    }
  }, [currentDeliverable]);

  return <DeliverableContext.Provider value={deliverableData}>{children}</DeliverableContext.Provider>;
};

export default DeliverableProvider;
