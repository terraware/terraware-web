import { createContext, useContext } from 'react';

import { Deliverable } from 'src/types/Deliverables';

export type DeliverableData = {
  currentDeliverable?: Deliverable;
  setCurrentDeliverable: (deliverable: Deliverable) => void;
};

// default values pointing to nothing
export const DeliverableContext = createContext<DeliverableData>({
  // tslint:disable-next-line:no-empty
  setCurrentDeliverable: () => {},
});

export const useDeliverableData = () => useContext(DeliverableContext);
