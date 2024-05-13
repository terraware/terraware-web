import React, { useEffect, useState } from 'react';

import { Deliverable } from 'src/types/Deliverables';

import { DeliverableContext, DeliverableData } from './DeliverableContext';

export type Props = {
  children: React.ReactNode;
};

const ParticipantProjectSpeciesProvider = ({ children }: Props) => {
  const [currentDeliverable, setCurrentDeliverable] = useState<Deliverable>();

  const _setCurrentDeliverable = (deliverable: Deliverable) => {
    setCurrentDeliverable(deliverable);
  };

  const [deliverableData, setDeliverableData] = useState<DeliverableData>({
    setCurrentDeliverable: _setCurrentDeliverable,
  });

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

export default ParticipantProjectSpeciesProvider;
