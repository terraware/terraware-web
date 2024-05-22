import { createContext, useContext } from 'react';

import { ServiceRequestType } from 'src/types/Support';

export type SupportData = {
  types: ServiceRequestType[];
};

// default values pointing to nothing
export const SupportContext = createContext<SupportData>({
  types: [],
});

export const useSupportData = () => useContext(SupportContext);
