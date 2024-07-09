import { createContext, useContext } from 'react';

import { Deliverable } from 'src/types/Deliverables';

export type DeliverableData = {
  currentDeliverable?: Deliverable;
  deliverableId: number;
  projectId: number;
};

// default values pointing to nothing
export const DeliverableContext = createContext<DeliverableData>({
  deliverableId: -1,
  projectId: -1,
});

export const useDeliverableData = () => useContext(DeliverableContext);
