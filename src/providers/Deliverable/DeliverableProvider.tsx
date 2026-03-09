import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import useFetchDeliverable from 'src/components/DeliverableView/useFetchDeliverable';

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

  const deliverableData = useMemo<DeliverableData>(
    () => ({
      currentDeliverable: deliverable,
      deliverableId,
      projectId,
    }),
    [deliverable, deliverableId, projectId]
  );

  return <DeliverableContext.Provider value={deliverableData}>{children}</DeliverableContext.Provider>;
};

export default DeliverableProvider;
