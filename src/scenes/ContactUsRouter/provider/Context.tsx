import { createContext, useContext } from 'react';

import { ServiceRequestType } from 'src/types/Support';

export type SupportData = {
  types?: ServiceRequestType[];
};

// default values pointing to nothing
export const SupportContext = createContext<SupportData>({
  types: undefined, // undefined instead of [] for not loaded state
});

export const useSupportData = () => useContext(SupportContext);
